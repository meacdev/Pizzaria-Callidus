/**
 * @file bebida.service.ts
 * @brief Serviço de acesso ao catálogo de bebidas (arquivo estático servido pela aplicação).
 */
import type { Bebida } from '../types/bebida';

const ENDPOINT = `${import.meta.env.BASE_URL}api/todasBebidas.json`;

/** @brief Busca a lista completa de bebidas do cardápio. @return Lista de bebidas disponíveis. */
export async function buscarBebidas(): Promise<Bebida[]> {
  const resposta = await fetch(ENDPOINT);

  if (!resposta.ok) {
    throw new Error(
      `Falha ao carregar bebidas: ${resposta.status}`,
    );
  }
  return (await resposta.json()) as Bebida[];
}