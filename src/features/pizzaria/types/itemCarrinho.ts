import type {
  Pizza,
  TamanhosDisponiveis,
} from './pizza';

export interface ItemCarrinho {
  readonly id: string;
  readonly pizza: Pizza;
  readonly quantidade: number;
  readonly tamanho: TamanhosDisponiveis;
  readonly ingredientesRemovidos: readonly string[];
  readonly extras: readonly string[];
  readonly borda: string | null;
  readonly precoUnitario: number;
}