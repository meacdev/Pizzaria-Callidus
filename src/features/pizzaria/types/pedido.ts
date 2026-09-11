/**
 * @file pedido.ts
 * @brief Tipos e rótulos do pedido do cliente, do recebimento até a entrega.
 */
import type { DadosCheckout } from './checkout';

/** @brief Etapas do ciclo de vida de um pedido, do recebimento até a entrega (ou cancelamento). */
export type StatusPedido = 'recebido' | 'preparo' | 'pronto' | 'saiu-entrega' | 'entregue' | 'cancelado';

/** @brief Rótulo em português exibido para cada status de pedido. */
export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  'recebido': 'Pedido recebido',
  'preparo': 'Em preparo',
  'pronto': 'Pronto para entrega',
  'saiu-entrega': 'Saiu para entrega',
  'entregue': 'Entregue',
  'cancelado': 'Cancelado',
};

/** @brief Ícone (emoji) exibido para cada status de pedido. */
export const STATUS_PEDIDO_ICONE: Record<StatusPedido, string> = {
  'recebido': '📥',
  'preparo': '👨‍🍳',
  'pronto': '📦',
  'saiu-entrega': '🛵',
  'entregue': '✅',
  'cancelado': '❌',
};

/** @brief Descrição amigável exibida ao cliente para cada status de pedido. */
export const STATUS_PEDIDO_DESCRICAO: Record<StatusPedido, string> = {
  'recebido': 'Seu pedido foi recebido e está na fila.',
  'preparo': 'Estamos preparando seu pedido com carinho.',
  'pronto': 'Seu pedido está pronto para sair para entrega.',
  'saiu-entrega': 'O entregador saiu e está a caminho!',
  'entregue': 'Pedido entregue. Bom apetite!',
  'cancelado': 'Pedido cancelado.',
};

/** @brief Item de um pedido já confirmado (forma reduzida do item de carrinho, sem os dados completos do produto). */
export interface ItemPedido {
  readonly id: string;
  readonly tipo: 'pizza' | 'bebida' | 'combo';
  readonly nome: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
}

/** @brief Pedido confirmado do cliente, com os dados de checkout, itens e status atual. */
export interface Pedido {
  readonly id: string;
  readonly status: StatusPedido;
  readonly dados: DadosCheckout;
  readonly itens: readonly ItemPedido[];
  readonly total: number;
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}