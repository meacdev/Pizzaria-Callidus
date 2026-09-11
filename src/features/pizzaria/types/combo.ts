/**
 * @file combo.ts
 * @brief Tipos de combo do cardápio.
 */

/** @brief Categoria de um combo, usada para agrupar/filtrar no cardápio. */
export type CategoriaCombo =
    | 'família'
    | 'casal'
    | 'individual'
    | 'promoção'
    | 'especial'
    | 'doce';

/** @brief Combo (kit) disponível no cardápio da pizzaria. */
export interface Combo {
    readonly id: string;
    readonly nome: string;
    readonly slug: string;
    readonly descricao: string;
    readonly precoBase: string;
    readonly imgURL: string;
    readonly categoria: CategoriaCombo;
    readonly itens: readonly string[];
}