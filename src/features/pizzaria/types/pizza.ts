export type TamanhosDisponiveis =
    'P' |
    'M' |
    'G' |
    'F';

export type Categoria =
    'tradicional' |
    'doce' |
    'artesanal';

export interface Pizza {
    readonly id: string;
    readonly nome: string;
    readonly slug: string;
    readonly descricao: string;
    readonly precoBase: string;
    readonly imgURL: string;
    readonly categoria: Categoria;
    readonly tamanhosDisponiveis: TamanhosDisponiveis;
    readonly permiteBorda: boolean;
}