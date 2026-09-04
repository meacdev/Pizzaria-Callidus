import type { ItemPedido } from '../../../store/pedido.store';

export interface ItemPedidoPayload {
  readonly id: string;
  readonly tipo: ItemPedido['tipo'];
  readonly nome: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
  readonly subtotal: number;
}

export interface ClientePedidoPayload {
  readonly nome: string;
  readonly email: string;
  readonly telefone: string;
}

export interface EnderecoPedidoPayload {
  readonly cep: string;
  readonly rua: string;
  readonly numero: string;
  readonly complemento: string;
  readonly bairro: string;
  readonly cidade: string;
}

export interface PagamentoPedidoPayload {
  readonly forma: string;
  readonly identificador: string;
  readonly detalhes: Readonly<Record<string, string | number>>;
  readonly confirmadoEm: string;
}

export interface GorjetaPedidoPayload {
  readonly percentual: number;
  readonly valor: number;
}

/**
 * Formato "final" do pedido, pensado para já sair no shape
 * que uma futura API de pedidos provavelmente esperaria.
 */
export interface PedidoPayload {
  readonly pedidoId: string;
  readonly criadoEm: string;
  readonly status: 'confirmado';
  readonly cliente: ClientePedidoPayload;
  readonly endereco: EnderecoPedidoPayload;
  readonly itens: readonly ItemPedidoPayload[];
  readonly observacoes: string;
  readonly pagamento: PagamentoPedidoPayload;
  readonly gorjeta: GorjetaPedidoPayload | null;
  readonly total: number;
}