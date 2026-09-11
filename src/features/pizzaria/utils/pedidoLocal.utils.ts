/**
 * @file pedidoLocal.utils.ts
 * @brief Monta e envia pedidos locais (totem e garçom), que não passam pelo carrinho/checkout do site.
 *
 * @details
 * Para pedidos feitos pelo carrinho/checkout do site, @see pedido.utils.ts.
 */
import type {
  ClientePedidoPayload,
  GorjetaPedidoPayload,
  ItemPedidoPayload,
  PagamentoPedidoPayload,
  PedidoPayload,
  CanalPedido,
} from '../types/pedidoPayload';
import { criarPedido, type PedidoApi } from '../api/pedido.service';
import type { ItemSelecionado } from '../hooks/useSeletorItens';

/**
 * Monta e envia pedidos que não passam pelo carrinho/checkout do site:
 * pedidos do totem de autoatendimento e pedidos lançados pelo garçom numa
 * mesa. Os dois têm origem 'local' (não vão para o entregador) e usam o
 * "canal" para o painel do garçom saber se o pedido já foi conferido/lançado
 * por ele mesmo ou se ainda precisa ser enviado para a cozinha.
 */
export interface NovoPedidoLocalInput {
  readonly canal: CanalPedido;
  readonly mesa: number | null;
  readonly cliente: Partial<ClientePedidoPayload> & { readonly nome: string };
  readonly itens: readonly ItemSelecionado[];
  readonly observacoes?: string;
  readonly gorjeta: GorjetaPedidoPayload | null;
  readonly pagamento: PagamentoPedidoPayload;
  /** Comanda da mesa a que esse pedido pertence (lançamentos do garçom). */
  readonly comandaId?: string | null;
  /** Garçom que lançou o pedido — usado no relatório gerencial para saber
   * o repasse de gorjeta de cada funcionário. */
  readonly funcionarioId?: number | null;
}

/**
 * @brief Converte os itens selecionados no totem/painel do garçom para o formato de payload do pedido, com subtotal calculado.
 * @param itens Itens selecionados.
 * @return Itens no formato de payload.
 */
export function itensPedidoPayload(itens: readonly ItemSelecionado[]): ItemPedidoPayload[] {
  return itens.map((item) => ({
    id: item.id,
    tipo: item.tipo,
    nome: item.nome,
    quantidade: item.quantidade,
    precoUnitario: item.precoUnitario,
    subtotal: Number((item.precoUnitario * item.quantidade).toFixed(2)),
  }));
}

/**
 * @brief Calcula o total do pedido (soma dos itens) somando a gorjeta, quando houver.
 * @param itens Itens selecionados.
 * @param gorjeta Gorjeta escolhida, ou `null` se não houver.
 * @return Total do pedido, arredondado a duas casas decimais.
 */
export function calcularTotalComGorjeta(itens: readonly ItemSelecionado[], gorjeta: GorjetaPedidoPayload | null): number {
  const subtotal = itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
  return Number((subtotal + (gorjeta?.valor ?? 0)).toFixed(2));
}

/** Pagamento "de balcão": já foi acertado na hora, não é uma simulação de cartão/pix. */
export function pagamentoLocalSimulado(forma: PagamentoPedidoPayload['forma'], observacao: string): PagamentoPedidoPayload {
  return {
    forma,
    identificador: observacao,
    detalhes: {},
    confirmadoEm: new Date().toISOString(),
  };
}

/**
 * @brief Monta o payload de um pedido local (totem ou garçom) e o envia ao backend.
 * @param input Dados do novo pedido local.
 * @return Pedido criado, conforme retornado pela API.
 */
export async function enviarPedidoLocal(input: NovoPedidoLocalInput): Promise<PedidoApi> {
  const itensPayload = itensPedidoPayload(input.itens);
  const total = calcularTotalComGorjeta(input.itens, input.gorjeta);

  const payload: PedidoPayload = {
    pedidoId: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    status: 'confirmado',
    origem: 'local',
    canal: input.canal,
    mesa: input.mesa,
    cliente: {
      nome: input.cliente.nome,
      email: input.cliente.email ?? '',
      telefone: input.cliente.telefone ?? '',
    },
    endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '' },
    itens: itensPayload,
    observacoes: input.observacoes ?? '',
    pagamento: input.pagamento,
    gorjeta: input.gorjeta,
    total,
  };

  return criarPedido(payload, { comandaId: input.comandaId, funcionarioId: input.funcionarioId });
}
