/**
 * @file bebida.ts
 * @brief Tipo de bebida do cardápio.
 */

/** @brief Bebida disponível no cardápio da pizzaria. */
export interface Bebida {
    readonly id: number;
    readonly nome: string;
    readonly descricao: string;
    readonly preco: number;
    readonly imgURL: string;
}