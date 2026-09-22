/**
 * @file itemCarrinho.ts
 * @brief Tipos dos itens que podem compor o carrinho de compras (pizza, bebida ou combo).
 */
import type {
  Pizza,
  TamanhosDisponiveis,
} from './pizza';
import type { Bebida } from './bebida';
import type { Combo } from './combo';

/** @brief Campos comuns a qualquer item do carrinho, independente do tipo. */
interface ItemCarrinhoBase {
  readonly id: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
}

/** @brief Item de carrinho referente a uma pizza personalizada (tamanho, extras e borda escolhidos). */
export interface ItemCarrinhoPizza
  extends ItemCarrinhoBase {
  readonly tipo: 'pizza';
  readonly pizza: Pizza;
  readonly tamanho: TamanhosDisponiveis;
  readonly ingredientesRemovidos:
  readonly string[];
  readonly extras:
  readonly string[];
  readonly borda: string | null;
}

/** @brief Item de carrinho referente a uma bebida. */
export interface ItemCarrinhoBebida
  extends ItemCarrinhoBase {
  readonly tipo: 'bebida';
  readonly bebida: Bebida;
}

/** @brief Item de carrinho referente a um combo. */
export interface ItemCarrinhoCombo
  extends ItemCarrinhoBase {
  readonly tipo: 'combo';
  readonly combo: Combo;
}

/** @brief União de todos os tipos possíveis de item de carrinho, discriminada pelo campo `tipo`. */
export type ItemCarrinho =
  | ItemCarrinhoPizza
  | ItemCarrinhoBebida
  | ItemCarrinhoCombo;