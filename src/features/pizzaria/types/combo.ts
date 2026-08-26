export type CategoriaCombo =
    | 'família'
    | 'casal'
    | 'individual'
    | 'promoção'
    | 'especial'
    | 'doce';

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