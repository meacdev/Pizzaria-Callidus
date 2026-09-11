/**
 * @file pizza.ts
 * @brief Tipos de pizza do cardápio.
 */

/** @brief Tamanhos de pizza disponíveis para escolha (P, M, G ou F de "família"). */
export type TamanhosDisponiveis =
  | 'P'
  | 'M'
  | 'G'
  | 'F';

/** @brief Categoria de uma pizza, usada para agrupar/filtrar no cardápio. */
export type Categoria =
  | 'tradicional'
  | 'doce'
  | 'artesanal';

/** @brief Ingrediente de uma pizza, usado para permitir sua remoção na personalização. */
export interface Ingrediente {
  readonly id: string;
  readonly nome: string;
}

/** @brief Pizza disponível no cardápio da pizzaria. */
export interface Pizza {
  readonly id: string;
  readonly nome: string;
  readonly slug: string;
  readonly descricao: string;
  readonly precoBase: string;
  readonly imgURL: string;
  readonly categoria: Categoria;

  readonly tamanhosDisponiveis:
    readonly TamanhosDisponiveis[];

  readonly permiteBorda: boolean;

  readonly ingredientes:
    readonly Ingrediente[];
}