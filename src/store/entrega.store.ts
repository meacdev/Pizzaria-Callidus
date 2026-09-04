import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePedidoStore, STATUS_PEDIDO_ORDEM, type StatusPedido } from './pedido.store';

interface AcompanhamentoInfo {
  historico: { status: StatusPedido; timestamp: string }[];
  simulacaoTimerId?: number | null;
}

export interface EntregaState {
  intervaloMs: number;
  pedidosAtivos: Record<string, AcompanhamentoInfo>;

  iniciarAcompanhamento: (pedidoId: string, statusInicial: StatusPedido) => void;
  avancarStatus: (pedidoId: string) => void;
  iniciarSimulacaoAutomatica: (pedidoId: string, intervaloMs?: number) => void;
  pararSimulacao: (pedidoId: string) => void;
  pararTodasSimulacoes: () => void;
}

export const useEntregaStore = create<EntregaState>()(
  persist(
    (set, get) => ({
      intervaloMs: 8000, // 8 segundos padrão
      pedidosAtivos: {},

      iniciarAcompanhamento: (pedidoId, statusInicial) => {
        set((state) => {
          // já está sendo acompanhado, não reseta o histórico
          if (state.pedidosAtivos[pedidoId]) return state;

          return {
            pedidosAtivos: {
              ...state.pedidosAtivos,
              [pedidoId]: {
                historico: [{ status: statusInicial, timestamp: new Date().toISOString() }],
                simulacaoTimerId: null,
              },
            },
          };
        });
      },

      avancarStatus: (pedidoId) => {
        const pedido = usePedidoStore.getState().pedidos.find((p) => p.id === pedidoId);
        if (!pedido) return;

        const idxAtual = STATUS_PEDIDO_ORDEM.indexOf(pedido.status);
        // já está em 'entregue' ou 'cancelado' (últimos dois da ordem), não avança
        if (idxAtual === -1 || idxAtual >= STATUS_PEDIDO_ORDEM.length - 2) return;

        const novoStatus = STATUS_PEDIDO_ORDEM[idxAtual + 1];
        usePedidoStore.getState().atualizarStatusPedido(pedidoId, novoStatus);

        set((state) => {
          const acompanhamento = state.pedidosAtivos[pedidoId];
          if (!acompanhamento) return state;
          return {
            pedidosAtivos: {
              ...state.pedidosAtivos,
              [pedidoId]: {
                ...acompanhamento,
                historico: [
                  ...acompanhamento.historico,
                  { status: novoStatus, timestamp: new Date().toISOString() },
                ],
              },
            },
          };
        });
      },

      iniciarSimulacaoAutomatica: (pedidoId, intervaloMs = get().intervaloMs) => {
        const { pedidosAtivos, avancarStatus, pararSimulacao } = get();
        const acompanhamento = pedidosAtivos[pedidoId];
        if (!acompanhamento) return;

        if (acompanhamento.simulacaoTimerId) {
          window.clearInterval(acompanhamento.simulacaoTimerId);
        }

        const timerId = window.setInterval(() => {
          const pedido = usePedidoStore.getState().pedidos.find((p) => p.id === pedidoId);
          if (!pedido || pedido.status === 'entregue' || pedido.status === 'cancelado') {
            pararSimulacao(pedidoId);
            return;
          }
          avancarStatus(pedidoId);
        }, intervaloMs);

        set((state) => ({
          intervaloMs,
          pedidosAtivos: {
            ...state.pedidosAtivos,
            [pedidoId]: { ...state.pedidosAtivos[pedidoId], simulacaoTimerId: timerId },
          },
        }));
      },

      pararSimulacao: (pedidoId) => {
        set((state) => {
          const acompanhamento = state.pedidosAtivos[pedidoId];
          if (acompanhamento?.simulacaoTimerId) {
            window.clearInterval(acompanhamento.simulacaoTimerId);
          }
          if (!acompanhamento) return state;
          return {
            pedidosAtivos: {
              ...state.pedidosAtivos,
              [pedidoId]: { ...acompanhamento, simulacaoTimerId: null },
            },
          };
        });
      },

      pararTodasSimulacoes: () => {
        const { pedidosAtivos } = get();
        Object.values(pedidosAtivos).forEach((acc) => {
          if (acc.simulacaoTimerId) window.clearInterval(acc.simulacaoTimerId);
        });
      },
    }),
    {
      name: 'pizzaria-entrega',
      partialize: (state) => ({
        pedidosAtivos: Object.fromEntries(
          Object.entries(state.pedidosAtivos).map(([id, acc]) => [
            id,
            { ...acc, simulacaoTimerId: null }, // não persiste timers
          ]),
        ),
        intervaloMs: state.intervaloMs,
      }),
    },
  ),
);