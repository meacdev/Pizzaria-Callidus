import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DadosCheckout } from '../features/pizzaria/types/checkout';

export interface ItemPedido {
  readonly id: string;
  readonly tipo: 'pizza' | 'bebida' | 'combo';
  readonly nome: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
}
export type StatusPedido = 'recebido' | 'preparo' | 'saiu-entrega' | 'entregue' | 'cancelado';

export interface Pedido {
  readonly id: string;                    
  readonly status: StatusPedido;           
  readonly dados: DadosCheckout;
  readonly itens: readonly ItemPedido[];
  readonly total: number;
  readonly criadoEm: string;
  readonly atualizadoEm: string;          
}

interface PedidoState {
  readonly pedido: Pedido | null;
  readonly definirPedido: (pedido: Pedido) => void;
  readonly limparPedido: () => void;
}

interface PedidosAdminState {
  readonly pedidos: readonly Pedido[];
  readonly adicionarPedido: (pedido: Pedido) => void;
  readonly atualizarStatus: (id: string, status: StatusPedido) => void;
}

export const usePedidoStore = create<PedidoState>()(
  persist(
    (set) => ({
      pedido: null,
      definirPedido: (pedido) => set({ pedido }),
      limparPedido: () => set({ pedido: null }),
    }),
    { name: 'pizzaria-pedido' },
  ),
);
