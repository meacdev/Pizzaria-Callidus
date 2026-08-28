import type { DadosCheckout } from './checkout';

export type StatusPedido = 'recebido' | 'preparo' | 'saiu-entrega' | 'entregue' | 'cancelado';

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  'recebido': 'Pedido recebido',
  'preparo': 'Em preparo',
  'saiu-entrega': 'Saiu para entrega',
  'entregue': 'Entregue',
  'cancelado': 'Cancelado',
};

export const STATUS_PEDIDO_ICONE: Record<StatusPedido, string> = {
  'recebido': '📥',
  'preparo': '👨‍🍳',
  'saiu-entrega': '🛵',
  'entregue': '✅',
  'cancelado': '❌',
};

export const STATUS_PEDIDO_DESCRICAO: Record<StatusPedido, string> = {
  'recebido': 'Seu pedido foi recebido e está na fila.',
  'preparo': 'Estamos preparando seu pedido com carinho.',
  'saiu-entrega': 'O entregador saiu e está a caminho!',
  'entregue': 'Pedido entregue. Bom apetite!',
  'cancelado': 'Pedido cancelado.',
};

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