import type { Bebida } from '../types/bebida';
const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const ENDPOINT = `${API_BASE}/bebidas`;
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init });
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.erro ?? `Falha na API: ${r.status}`);
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}
export async function buscarBebidas(): Promise<Bebida[]> { return request<Bebida[]>(ENDPOINT); }
export async function buscarBebidaPorId(id: string): Promise<Bebida> { return request<Bebida>(`${ENDPOINT}/${id}`); }
export async function criarBebida(bebida: Omit<Bebida, 'id'>): Promise<Bebida> { return request<Bebida>(ENDPOINT, { method: 'POST', body: JSON.stringify(bebida) }); }
export async function atualizarBebida(id: number, bebida: Omit<Bebida, 'id'>): Promise<Bebida> { return request<Bebida>(`${ENDPOINT}/${id}`, { method: 'PUT', body: JSON.stringify(bebida) }); }
export async function excluirBebida(id: number): Promise<void> { await request<void>(`${ENDPOINT}/${id}`, { method: 'DELETE' }); }
