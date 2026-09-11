/**
 * @file combo.service.ts
 * @brief Serviço de acesso ao catálogo de combos (arquivo estático servido pela aplicação).
 */
import type { Combo } from '../types/combo';

const ENDPOINT = `${import.meta.env.BASE_URL}api/todosCombos.json`;

/** @brief Busca a lista completa de combos do cardápio. @return Lista de combos disponíveis. */
export async function buscarCombos(): Promise<Combo[]> {
  const resposta = await fetch(ENDPOINT);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar: ${resposta.status}`);
  }
  return (await resposta.json()) as Combo[];
}