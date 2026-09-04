import type { Pedido, StatusPedido } from '../../../store/pedido.store';

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const ENDPOINT = `${API_BASE}/pedidos`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init });
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.erro ?? `Falha na API: ${r.status}`);
  return r.json() as Promise<T>;
}

export async function criarPedido(payload: unknown): Promise<Pedido> {
  return request<Pedido>(ENDPOINT, { method: 'POST', body: JSON.stringify(payload) });
}
export async function buscarPedidos(params?: { status?: StatusPedido; origem?: string }): Promise<Pedido[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.origem) query.set('origem', params.origem);
  return request<Pedido[]>(`${ENDPOINT}${query.size ? `?${query}` : ''}`);
}
export async function buscarPedido(id: string): Promise<Pedido> { return request<Pedido>(`${ENDPOINT}/${id}`); }
export async function atualizarStatusPedido(id: string, status: StatusPedido): Promise<Pedido> {
  return request<Pedido>(`${ENDPOINT}/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
export async function buscarFilaCozinha(): Promise<Pedido[]> { return request<Pedido[]>(`${API_BASE}/cozinha/pedidos`); }
export async function buscarFilaEntrega(): Promise<Pedido[]> { return request<Pedido[]>(`${API_BASE}/entrega/pedidos`); }
