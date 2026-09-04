import type { ItemPedido, OrigemPedido } from '../../../store/pedido.store';

/**
 * Por onde o pedido entrou no sistema:
 * - 'site': cliente pediu pelo site/app de casa (sempre origem 'site').
 * - 'totem': cliente se autoatendeu no totem dentro do restaurante.
 * - 'garcom': o próprio garçom lançou o pedido numa mesa pelo balcão.
 *
 * Existe além de "origem" porque tanto um pedido do totem quanto um pedido
 * lançado pelo garçom têm origem 'local' — o canal é o que diferencia, no
 * painel do garçom, um pedido que ainda precisa ser conferido e enviado pra
 * cozinha (site/totem) de um que o próprio garçom já mandou direto.
 */
export type CanalPedido = 'site' | 'totem' | 'garcom';

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
  readonly origem: OrigemPedido;
  readonly canal: CanalPedido;
  readonly mesa: number | null;
  readonly cliente: ClientePedidoPayload;
  readonly endereco: EnderecoPedidoPayload;
  readonly itens: readonly ItemPedidoPayload[];
  readonly observacoes: string;
  readonly pagamento: PagamentoPedidoPayload;
  readonly gorjeta: GorjetaPedidoPayload | null;
  readonly total: number;
}