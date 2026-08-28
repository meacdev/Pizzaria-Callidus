import type { Pedido } from '../../../store/pedido.store';
import type { InfoPagamentoSimulado } from '../types/pagamento';
import type { PedidoPayload } from '../types/pedidoPayload';

function gerarIdPedido(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `pedido-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function gerarPedidoPayload(
  pedido: Pedido,
  infoPagamento: InfoPagamentoSimulado,
): PedidoPayload {
  return {
    pedidoId: gerarIdPedido(),
    criadoEm: pedido.criadoEm,
    status: 'confirmado',
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
      estado: pedido.dados.endereco.estado,
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
    total: pedido.total,
  };
}

export function gerarPedidoJSON(
  pedido: Pedido,
  infoPagamento: InfoPagamentoSimulado,
): string {
  return JSON.stringify(gerarPedidoPayload(pedido, infoPagamento), null, 2);
}

export async function enviarPedido(
  pedido: Pedido,
  infoPagamento: InfoPagamentoSimulado,
): Promise<PedidoPayload> {
  const payload = gerarPedidoPayload(pedido, infoPagamento);

  console.log('[pedido] payload pronto para envio futuro:', payload);

  return payload;
}