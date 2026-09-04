import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePedidoStore, STATUS_PEDIDO_ORDEM, type StatusPedido } from './pedido.store';

export interface NotificacaoEntrega {
  readonly id: string;
  readonly pedidoId: string;
  readonly mensagem: string;
  readonly criadaEm: string;
}

interface AcompanhamentoInfo {
  historico: { status: StatusPedido; timestamp: string }[];
  simulacaoTimerId?: number | null;
}

export interface EntregaState {
  intervaloMs: number;
  pedidosAtivos: Record<string, AcompanhamentoInfo>;
  pedidosNaRota: string[];
  notificacoes: NotificacaoEntrega[];

  iniciarAcompanhamento: (pedidoId: string, statusInicial: StatusPedido) => void;
  avancarStatus: (pedidoId: string) => void;
  iniciarSimulacaoAutomatica: (pedidoId: string, intervaloMs?: number) => void;
  pararSimulacao: (pedidoId: string) => void;
  pararTodasSimulacoes: () => void;
  adicionarPedidoNaRota: (pedidoId: string) => void;
  removerPedidoDaRota: (pedidoId: string) => void;
  concluirEntrega: (pedidoId: string) => void;
}

export const useEntregaStore = create<EntregaState>()(
  persist(
    (set, get) => ({
      intervaloMs: 8000, // 8 segundos padrão
      pedidosAtivos: {},
      pedidosNaRota: [],
      notificacoes: [],

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



      adicionarPedidoNaRota: (pedidoId) => {
        const pedido = usePedidoStore.getState().pedidos.find((p) => p.id === pedidoId);
        if (!pedido || (pedido.status !== 'pronto' && pedido.status !== 'saiu_para_entrega')) return;

        set((state) => ({
          pedidosNaRota: state.pedidosNaRota.includes(pedidoId)
            ? state.pedidosNaRota
            : [...state.pedidosNaRota, pedidoId],
        }));
      },

      removerPedidoDaRota: (pedidoId) => {
        set((state) => ({
          pedidosNaRota: state.pedidosNaRota.filter((id) => id !== pedidoId),
        }));
      },

      concluirEntrega: (pedidoId) => {
        const pedido = usePedidoStore.getState().pedidos.find((p) => p.id === pedidoId);
        if (!pedido || pedido.status !== 'saiu_para_entrega') return;

        usePedidoStore.getState().atualizarStatusPedido(pedidoId, 'entregue');

        const notificacao: NotificacaoEntrega = {
          id: crypto.randomUUID(),
          pedidoId,
          mensagem: `O pedido #${pedidoId.slice(0, 8).toUpperCase()} foi entregue pelo entregador.`,
          criadaEm: new Date().toISOString(),
        };

        set((state) => ({
          pedidosNaRota: state.pedidosNaRota.filter((id) => id !== pedidoId),
          notificacoes: [notificacao, ...state.notificacoes].slice(0, 30),
        }));
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
        pedidosNaRota: state.pedidosNaRota,
        notificacoes: state.notificacoes,
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