/**
 * @file precoPizza.utils.ts
 * @brief Cálculo do preço unitário de uma pizza personalizada.
 */
import type { Pizza, TamanhosDisponiveis } from '../types/pizza';
import { extras as EXTRAS_DISPONIVEIS } from '../types/extras';

/** @brief Valor adicional cobrado por tamanho de pizza. */
export const ADICIONAL_TAMANHO: Record<TamanhosDisponiveis, number> = {
  P: 0,
  M: 5,
  G: 10,
  F: 15,
};

/** @brief Valor adicional cobrado por tipo de borda recheada. */
export const ADICIONAL_BORDA: Record<string, number> = {
  catupiry: 7,
  cheddar: 7,
};

/**
 * Calcula o preço unitário de uma pizza personalizada (preço base + tamanho +
 * extras selecionados + borda). Centralizado aqui para que o menu
 * (PizzaPersonalizacao) e o "repetir último pedido" nunca calculem o preço de
 * formas diferentes.
 */
export function calcularPrecoPizza(
  pizza: Pizza,
  tamanho: TamanhosDisponiveis,
  extrasSelecionados: readonly string[],
  borda: string | null,
): number {
  const precoTamanho = ADICIONAL_TAMANHO[tamanho] ?? 0;

  const precoExtras = EXTRAS_DISPONIVEIS.filter((extra) =>
    extrasSelecionados.includes(extra.id),
  ).reduce((total, extra) => total + Number(extra.preco), 0);

  const precoBorda = borda ? (ADICIONAL_BORDA[borda] ?? 0) : 0;

  return Number(pizza.precoBase) + precoTamanho + precoExtras + precoBorda;
}