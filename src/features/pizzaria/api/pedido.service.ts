import type { PedidoPayload } from '../types/pedidoPayload';
import type { StatusPedido } from '../../../store/pedido.store';

export interface PedidoApi extends Omit<PedidoPayload, 'status'> {
  readonly status: StatusPedido;
  readonly atualizadoEm: string;
  /** Comanda da mesa a que esse pedido está vinculado (null = sem comanda —
   * pedidos do site/balcão sem mesa não têm comanda). */
  readonly comandaId: string | null;
  /** Funcionário "responsável" pelo pedido para fins de repasse de gorjeta
   * no relatório gerencial — o garçom que lançou o pedido, ou o entregador
   * que saiu com ele para entrega. */
  readonly funcionarioId: number | null;
  /** Cliente cadastrado que fez o pedido (null em pedidos do totem/balcão,
   * ou quando o cliente não estava logado no checkout). */
  readonly clienteId: number | null;
  /** Cozinheiro que preparou o pedido — só para rastreamento do fluxo. */
  readonly preparadoPorId: number | null;
}

async function requisicao<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const dados = (await resposta.json().catch(() => ({}))) as T & { erro?: string };

  if (!resposta.ok) {
    throw new Error(dados.erro ?? `Erro HTTP ${resposta.status}`);
  }

  return dados;
}

export interface AtribuicaoPedido {
  /** Comanda da mesa a que esse pedido deve ser vinculado. */
  readonly comandaId?: string | null;
  /** Funcionário que lançou o pedido (garçom na mesa). */
  readonly funcionarioId?: number | null;
  /** Cliente logado que fez o pedido pelo site (programa de fidelidade e
   * histórico de compras). */
  readonly clienteId?: number | null;
}

export function criarPedido(payload: PedidoPayload, atribuicao?: AtribuicaoPedido): Promise<PedidoApi> {
  return requisicao<PedidoApi>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ ...payload, ...atribuicao }),
  });
}

export function obterPedido(pedidoId: string): Promise<PedidoApi> {
  return requisicao<PedidoApi>(`/api/pedidos/${encodeURIComponent(pedidoId)}`);
}

export function listarPedidos(status?: string): Promise<PedidoApi[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return requisicao<PedidoApi[]>(`/api/pedidos${query}`);
}

export function atualizarStatusPedidoApi(
  pedidoId: string,
  status: string,
  funcionarioId?: number | null,
  preparadoPorId?: number | null,
): Promise<PedidoApi> {
  return requisicao<PedidoApi>(`/api/pedidos/${encodeURIComponent(pedidoId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      ...(funcionarioId != null ? { funcionarioId } : {}),
      ...(preparadoPorId != null ? { preparadoPorId } : {}),
    }),
  });
}
