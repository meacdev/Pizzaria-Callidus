/**
 * @file pedido.store.ts
 * @brief Store (zustand) do pedido atual e do histórico de pedidos do cliente.
 *
 * @details
 * Define os tipos de domínio do pedido (@see Pedido, @see StatusPedido,
 * @see OrigemPedido) e persiste a lista de pedidos e o pedido corrente no
 * localStorage (`pizzaria-pedido`). O status de cada pedido é avançado por
 * @see entrega.store, que também lê `STATUS_PEDIDO_ORDEM` para saber a
 * sequência esperada de status.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DadosCheckout } from '../features/pizzaria/types/checkout';
import type { ItemCarrinho } from '../features/pizzaria/types/itemCarrinho';

/**
 * De onde o pedido veio:
 * - 'site': cliente pediu pelo site/app, em casa — precisa de entrega.
 * - 'local': pedido feito no próprio estabelecimento (totem de
 *   autoatendimento ou lançado pelo garçom numa mesa) — nunca vai para a
 *   rota do entregador.
 */
export type OrigemPedido = 'site' | 'local';

export type StatusPedido =
  | 'recebido'
  | 'em_preparo'
  | 'pronto'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado';

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  recebido: 'Na fila',
  em_preparo: 'Em preparo',
  pronto: 'Concluído / aguardando envio',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const STATUS_PEDIDO_ORDEM: readonly StatusPedido[] = [
  'recebido',
  'em_preparo',
  'pronto',
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

export interface GorjetaPedido {
  readonly percentual: number;
  readonly valor: number;
}

/** @brief Cupom de desconto aplicado a um pedido no checkout (@see CheckoutPage). */
export interface CupomPedido {
  /** Código do cupom informado pelo cliente (ex.: "BEMVINDO10"). */
  readonly codigo: string;
  /** Valor em reais já descontado do subtotal (independe de ser percentual ou fixo). */
  readonly desconto: number;
}

export interface Pedido {
  readonly id: string;
  readonly status: StatusPedido;
  readonly dados: DadosCheckout;
  readonly itens: readonly ItemPedido[];
  /**
   * Cópia dos itens originais do carrinho (com personalização de pizza,
   * objeto da bebida/combo etc.), usada para reconstruir o pedido quando o
   * cliente quiser "pedir de novo" com um clique. `itens` acima continua
   * existindo só para exibição (acompanhamento, admin).
   */
  readonly itensCarrinho: readonly ItemCarrinho[];
  readonly total: number;
  readonly gorjeta: GorjetaPedido | null;
  /** Cupom de desconto aplicado no checkout, ou `null` se nenhum foi usado. */
  readonly cupom: CupomPedido | null;
  /** 'site' (padrão) = pedido pelo site, precisa de entrega. 'local' = totem/garçom, não vai para o entregador. */
  readonly origem: OrigemPedido;
  /** Número da mesa, quando o pedido foi lançado pelo garçom numa mesa. Null para site e totem (retirada no balcão). */
  readonly mesa: number | null;
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

/** @brief Dados de um pedido ainda não criado (sem id e sem status, atribuídos ao ser registrado). */
export type NovoPedido = Omit<Pedido, 'id' | 'status'>;

/** @brief Estado e ações do pedido atual e do histórico de pedidos. */
interface PedidoState {
  readonly pedido: Pedido | null;
  readonly pedidos: readonly Pedido[];
  readonly definirPedido: (pedido: NovoPedido) => void;
  readonly atualizarStatusPedido: (id: string, status: StatusPedido) => void;
  readonly limparPedido: () => void;
}

/** @brief Store do pedido atual e do histórico de pedidos do cliente. */
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
            pedido.id === id ? { ...pedido, status, atualizadoEm: new Date().toISOString() } : pedido,
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