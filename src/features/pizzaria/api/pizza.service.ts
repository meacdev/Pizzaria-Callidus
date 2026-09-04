import type { Ingrediente, Pizza, TamanhosDisponiveis } from '../types/pizza';

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const ENDPOINT = `${API_BASE}/pizzas`;
const TAMANHOS_PADRAO: readonly TamanhosDisponiveis[] = ['P', 'M', 'G'];

function normalizarIngredientes(value: unknown): Ingrediente[] {
  if (!Array.isArray(value)) return [];
  return value.filter((i): i is Record<string, unknown> => typeof i === 'object' && i !== null)
    .map((i) => ({ id: typeof i.id === 'string' ? i.id : crypto.randomUUID(), nome: typeof i.nome === 'string' ? i.nome : '' }))
    .filter((i) => i.nome.trim() !== '');
}

function normalizarPizza(pizza: Partial<Pizza>): Pizza {
  const tamanhos = Array.isArray(pizza.tamanhosDisponiveis)
    ? pizza.tamanhosDisponiveis.filter((t): t is TamanhosDisponiveis => ['P', 'M', 'G', 'F'].includes(t as string))
    : [...TAMANHOS_PADRAO];
  return {
    id: String(pizza.id ?? crypto.randomUUID()), nome: String(pizza.nome ?? ''), slug: String(pizza.slug ?? ''),
    descricao: String(pizza.descricao ?? ''), precoBase: String(pizza.precoBase ?? '0'), imgURL: String(pizza.imgURL ?? ''),
    categoria: pizza.categoria === 'doce' || pizza.categoria === 'artesanal' ? pizza.categoria : 'tradicional',
    tamanhosDisponiveis: tamanhos.length ? [...new Set(tamanhos)] : [...TAMANHOS_PADRAO],
    permiteBorda: pizza.permiteBorda ?? true, ingredientes: normalizarIngredientes(pizza.ingredientes),
  };
}

async function requisicao<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init });
  if (!resposta.ok) throw new Error((await resposta.json().catch(() => null))?.erro ?? `Falha na API: ${resposta.status}`);
  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

export async function buscarPizzas(): Promise<Pizza[]> {
  const dados = await requisicao<unknown[]>(ENDPOINT);
  return dados.map((pizza) => normalizarPizza(pizza as Partial<Pizza>));
}

export async function buscarPizzaPorSlug(slug: string): Promise<Pizza> {
  return normalizarPizza(await requisicao<Partial<Pizza>>(`${ENDPOINT}/${encodeURIComponent(slug)}`));
}

export async function criarPizza(pizza: Omit<Pizza, 'id'>): Promise<Pizza> {
  return normalizarPizza(await requisicao<Partial<Pizza>>(ENDPOINT, { method: 'POST', body: JSON.stringify(pizza) }));
}

export async function atualizarPizza(id: string, pizza: Omit<Pizza, 'id'>): Promise<Pizza> {
  return normalizarPizza(await requisicao<Partial<Pizza>>(`${ENDPOINT}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(pizza) }));
}

export async function excluirPizza(id: string): Promise<void> {
  await requisicao<void>(`${ENDPOINT}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Compatibilidade com código antigo: o catálogo agora é salvo no backend.
export function salvarPizzas(_pizzas: Pizza[]): void {
  console.warn('salvarPizzas foi mantido apenas para compatibilidade. Use criarPizza/atualizarPizza.');
}
