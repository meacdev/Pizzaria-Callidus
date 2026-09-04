import type { Combo } from '../types/combo';
const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const ENDPOINT = `${API_BASE}/combos`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init });
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.erro ?? `Falha na API: ${r.status}`);
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}
export async function buscarCombos(): Promise<Combo[]> { return request<Combo[]>(ENDPOINT); }
export async function buscarComboPorSlug(slug: string): Promise<Combo> { return request<Combo>(`${ENDPOINT}/${encodeURIComponent(slug)}`); }
export async function criarCombo(combo: Omit<Combo, 'id'>): Promise<Combo> { return request<Combo>(ENDPOINT, { method: 'POST', body: JSON.stringify(combo) }); }
export async function atualizarCombo(id: string, combo: Omit<Combo, 'id'>): Promise<Combo> { return request<Combo>(`${ENDPOINT}/${id}`, { method: 'PUT', body: JSON.stringify(combo) }); }
export async function excluirCombo(id: string): Promise<void> { await request<void>(`${ENDPOINT}/${id}`, { method: 'DELETE' }); }
