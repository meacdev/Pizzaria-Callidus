/**
 * @file cupom.ts
 * @brief Tipos e valores padrão dos cupons de desconto da loja.
 *
 * @details
 * Cupons são configurados na área de customização (@see CampoCupons, em
 * CustomizationPage.tsx) e exibidos publicamente em um carrossel na home
 * (@see CarrosselCupons) e na página /cupons (@see CuponsPage).
 */

/** @brief Forma como o desconto de um cupom é calculado. */
export type TipoDescontoCupom = 'percentual' | 'fixo';

/** @brief Cupom de desconto configurável pela loja. */
export interface Cupom {
    readonly id: string;
    /** Código que o cliente informa no checkout (ex.: "BEMVINDO10"). */
    readonly codigo: string;
    /** Título curto exibido no carrossel/card (ex.: "10% de desconto"). */
    readonly titulo: string;
    /** Descrição livre com as condições do cupom. */
    readonly descricao: string;
    readonly tipoDesconto: TipoDescontoCupom;
    /** Valor do desconto: percentual (0-100) se `tipoDesconto` for "percentual", ou reais se for "fixo". */
    readonly valor: number;
    /** Se `false`, o cupom fica guardado mas não aparece publicamente. */
    readonly ativo: boolean;
    /** Data de validade no formato "AAAA-MM-DD" (inclusive), ou `null` para sem validade definida. */
    readonly validoAte: string | null;
}

/**
 * @brief Cupons de exemplo usados na primeira vez que a loja abre a customização
 * (nenhum cupom salvo ainda), só para a área não começar vazia.
 */
export const CUPONS_PADRAO: readonly Cupom[] = [
    {
        id: 'cupom-boas-vindas',
        codigo: 'BEMVINDO10',
        titulo: '10% de desconto',
        descricao: 'Válido no primeiro pedido pelo site.',
        tipoDesconto: 'percentual',
        valor: 10,
        ativo: true,
        validoAte: null,
    },
    {
        id: 'cupom-cinco-reais',
        codigo: 'CALLIDUS5',
        titulo: 'R$ 5 de desconto',
        descricao: 'Em pedidos acima de R$ 40.',
        tipoDesconto: 'fixo',
        valor: 5,
        ativo: true,
        validoAte: null,
    },
];
