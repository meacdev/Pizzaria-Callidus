import type {
  Pizza,
  TamanhosDisponiveis,
} from './pizza';
import type { Bebida } from './bebida';
import type { Combo } from './combo';

interface ItemCarrinhoBase {
  readonly id: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
}

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

export interface ItemCarrinhoBebida
  extends ItemCarrinhoBase {
  readonly tipo: 'bebida';
  readonly bebida: Bebida;
}

export interface ItemCarrinhoCombo
  extends ItemCarrinhoBase {
  readonly tipo: 'combo';
  readonly combo: Combo;
}

export type ItemCarrinho =
  | ItemCarrinhoPizza
  | ItemCarrinhoBebida
  | ItemCarrinhoCombo;