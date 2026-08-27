import type { Bebida } from '../types/bebida';

const ENDPOINT = '/api/todasBebidas.json';

export async function buscarBebidas(): Promise<Bebida[]> {
  const resposta = await fetch(ENDPOINT);

  if (!resposta.ok) {
    throw new Error(
      `Falha ao carregar bebidas: ${resposta.status}`,
    );
  }
  return (await resposta.json()) as Bebida[];
}