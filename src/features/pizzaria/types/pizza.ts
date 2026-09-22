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

/**
 * @brief Desconto temporário ("pizza em promoção") configurado na gestão de
 * cardápio. `inicio`/`fim` são datas no formato "AAAA-MM-DD" (inclusive) —
 * a pizza só é considerada em promoção nesse intervalo (@see
 * pizzaEmPromocao em pizza.utils.ts).
 */
export interface DescontoPizza {
  /** Percentual de desconto sobre `precoBase`, de 1 a 90. */
  readonly percentual: number;
  /** Data de início da promoção, no formato "AAAA-MM-DD". */
  readonly inicio: string;
  /** Data de fim da promoção (inclusive), no formato "AAAA-MM-DD". */
  readonly fim: string;
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

  /** Desconto temporário ativo/agendado, ou `null`/`undefined` se a pizza não está em promoção. */
  readonly desconto?: DescontoPizza | null;
}