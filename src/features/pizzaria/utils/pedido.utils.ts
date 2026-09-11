/**
 * @file pedido.utils.ts
 * @brief Monta e envia ao backend o pedido feito pelo carrinho/checkout do site.
 *
 * @details
 * Para pedidos que não passam pelo carrinho do site (totem e garçom),
 * @see pedidoLocal.utils.ts.
 */
import type { Pedido } from '../../../store/pedido.store';
import type { InfoPagamentoSimulado } from '../types/pagamento';
import type { PedidoPayload } from '../types/pedidoPayload';
import { criarPedido, type PedidoApi } from '../api/pedido.service';

/**
 * @brief Monta o payload final do pedido (@see PedidoPayload) a partir do pedido do carrinho e da informação de pagamento.
 * @param pedido Pedido montado no carrinho/checkout.
 * @param infoPagamento Resultado do pagamento simulado.
 * @return Payload pronto para ser enviado ao backend.
 */
export function gerarPedidoPayload(
  pedido: Pedido,
  infoPagamento: InfoPagamentoSimulado,
): PedidoPayload {
  return {
    pedidoId: pedido.id,
    criadoEm: pedido.criadoEm,
    status: 'confirmado',
    origem: pedido.origem,
    // Todo pedido que passa pelo carrinho/checkout do site é do canal
    // 'site' — os canais 'totem' e 'garcom' são montados por
    // pedidoLocal.utils.ts, que não usa esta função.
    canal: 'site',
    mesa: pedido.mesa,
    cliente: {
      nome: pedido.dados.cliente.nome,
      email: pedido.dados.cliente.email,
      telefone: pedido.dados.cliente.telefone,
    },
    endereco: {
      cep: pedido.dados.endereco.cep,
      rua: pedido.dados.endereco.rua,
      numero: pedido.dados.endereco.numero,
      complemento: pedido.dados.endereco.complemento,
      bairro: pedido.dados.endereco.bairro,
      cidade: pedido.dados.endereco.cidade,
    },
    itens: pedido.itens.map((item) => ({
      id: item.id,
      tipo: item.tipo,
      nome: item.nome,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: Number((item.precoUnitario * item.quantidade).toFixed(2)),
    })),
    observacoes: pedido.dados.observacoes,
    pagamento: {
      forma: infoPagamento.forma,
      identificador: infoPagamento.identificador,
      detalhes: infoPagamento.detalhes,
      confirmadoEm: infoPagamento.confirmadoEm,
    },
    gorjeta: pedido.gorjeta,
    total: pedido.total,
  };
}

/**
 * @brief Gera a representação em JSON (indentado) do payload do pedido, útil para depuração/log.
 * @param pedido Pedido montado no carrinho/checkout.
 * @param infoPagamento Resultado do pagamento simulado.
 * @return JSON formatado do payload do pedido.
 */
export function gerarPedidoJSON(
  pedido: Pedido,
  infoPagamento: InfoPagamentoSimulado,
): string {
  return JSON.stringify(gerarPedidoPayload(pedido, infoPagamento), null, 2);
}

/**
 * @brief Monta o payload do pedido e o envia ao backend, vinculando ao cliente logado quando houver.
 * @param pedido Pedido montado no carrinho/checkout.
 * @param infoPagamento Resultado do pagamento simulado.
 * @param clienteId Id do cliente autenticado, quando houver sessão ativa.
 * @return Pedido criado, conforme retornado pela API.
 */
export async function enviarPedido(
  pedido: Pedido,
  infoPagamento: InfoPagamentoSimulado,
  clienteId?: number | null,
): Promise<PedidoApi> {
  const payload = gerarPedidoPayload(pedido, infoPagamento);
  const pedidoCriado = await criarPedido(payload, clienteId != null ? { clienteId } : undefined);

  console.log('[pedido] pedido enviado para o backend:', pedidoCriado);
  return pedidoCriado;
}
