import type { Pizza } from '../types/pizza';

const ENDPOINT = '/api/todasPizzas.json';

export async function buscarPizzas(): Promise<Pizza[]> {
  const resposta = await fetch(ENDPOINT);

  if (!resposta.ok) {
    throw new Error(`Falha ao carregar: ${resposta.status}`);
  }

  return (await resposta.json()) as Pizza[];
}
