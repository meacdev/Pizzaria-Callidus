import type { Combo } from '../types/combo';
const ENDPOINT = '/api/todosCombos.json';

export async function buscarCombos(): Promise<Combo[]> {
  const resposta = await fetch(ENDPOINT);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar: ${resposta.status}`);
  }
  return (await resposta.json()) as Combo[];
}