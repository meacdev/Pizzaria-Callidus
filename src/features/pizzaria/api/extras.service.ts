import type { Extra } from '../types/extras';
export async function buscarExtras(): Promise<Extra[]> {
  const r = await fetch(`${(import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')}/extras`);
  if (!r.ok) throw new Error('Falha ao carregar extras.');
  return r.json();
}
