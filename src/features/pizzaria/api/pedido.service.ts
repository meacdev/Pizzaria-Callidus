import type { PedidoPayload } from '../types/pedidoPayload';
import type { StatusPedido } from '../../../store/pedido.store';

export interface PedidoApi extends Omit<PedidoPayload, 'status'> {
  readonly status: StatusPedido;
  readonly atualizadoEm: string;
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

export function criarPedido(payload: PedidoPayload): Promise<PedidoApi> {
  return requisicao<PedidoApi>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify(payload),
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
): Promise<PedidoApi> {
  return requisicao<PedidoApi>(`/api/pedidos/${encodeURIComponent(pedidoId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
