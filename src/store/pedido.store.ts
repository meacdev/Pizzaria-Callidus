import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DadosCheckout } from '../features/pizzaria/types/checkout';

export interface ItemPedido {
  readonly pizzaId: string;
  readonly nome: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
}

export interface Pedido {
  readonly dados: DadosCheckout;
  readonly itens: readonly ItemPedido[];
  readonly total: number;
  readonly criadoEm: string;
}

interface PedidoState {
  readonly pedido: Pedido | null;
  readonly definirPedido: (pedido: Pedido) => void;
  readonly limparPedido: () => void;
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
