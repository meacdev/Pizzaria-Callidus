import type { Pizza } from '../types/pizza';

const ENDPOINT = `${import.meta.env.BASE_URL}api/todasPizzas.json`;
const STORAGE_KEY = 'pizzaria_pizzas';

export async function buscarPizzas(): Promise<Pizza[]> {
  const cache = localStorage.getItem(STORAGE_KEY);

  if (cache) {
    try {
      return JSON.parse(cache) as Pizza[];
    } catch {
      // cache corrompido: ignora e recarrega da fonte original
    }
  }

  const resposta = await fetch(ENDPOINT);

  if (!resposta.ok) {
    throw new Error(`Falha ao carregar: ${resposta.status}`);
  }

  const pizzas = (await resposta.json()) as Pizza[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pizzas));
  return pizzas;
}

export function salvarPizzas(pizzas: Pizza[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pizzas));
}
