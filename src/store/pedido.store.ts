import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DadosCheckout } from '../features/pizzaria/types/checkout';

export type StatusPedido =
  | 'recebido'
  | 'em_preparo'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado';

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  recebido: 'Recebido',
  em_preparo: 'Em preparo',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const STATUS_PEDIDO_ORDEM: readonly StatusPedido[] = [
  'recebido',
  'em_preparo',
  'saiu_para_entrega',
  'entregue',
  'cancelado',
];

export interface ItemPedido {
  readonly id: string;
  readonly tipo: 'pizza' | 'bebida' | 'combo';
  readonly nome: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
}

export interface Pedido {
  readonly id: string;                    
  readonly status: StatusPedido;           
  readonly dados: DadosCheckout;
  readonly itens: readonly ItemPedido[];
  readonly total: number;
  readonly criadoEm: string;
  readonly atualizadoEm: string;          
}

export type NovoPedido = Omit<Pedido, 'id' | 'status'>;

interface PedidoState {
  readonly pedido: Pedido | null;
  readonly pedidos: readonly Pedido[];
  readonly definirPedido: (pedido: NovoPedido) => void;
  readonly atualizarStatusPedido: (id: string, status: StatusPedido) => void;
  readonly limparPedido: () => void;
}

export const usePedidoStore = create<PedidoState>()(
  persist(
    (set) => ({
      pedido: null,
      pedidos: [],
      definirPedido: (novoPedido) =>
        set((state) => {
          const pedido: Pedido = {
            ...novoPedido,
            id: crypto.randomUUID(),
            status: 'recebido',
          };
          return {
            pedido,
            pedidos: [pedido, ...state.pedidos],
          };
        }),
      atualizarStatusPedido: (id, status) =>
        set((state) => ({
          pedidos: state.pedidos.map((pedido) =>
            pedido.id === id ? { ...pedido, status } : pedido,
          ),
          pedido:
            state.pedido?.id === id
              ? { ...state.pedido, status }
              : state.pedido,
        })),
      limparPedido: () => set({ pedido: null }),
    }),
    { name: 'pizzaria-pedido' },
  ),
);
