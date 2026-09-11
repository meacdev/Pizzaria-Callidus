/**
 * @file relatorio.ts
 * @brief Formato do relatório gerencial de vendas (veja server/app.py: /api/relatorios/vendas).
 */

/** @brief Item (pizza, bebida ou combo) mais vendido em um período, com a quantidade vendida. */
export interface ItemMaisVendido {
    readonly nome: string;
    readonly quantidade: number;
}

/** @brief Quantidade de pedidos e total vendido em um canal de venda (presencial ou entrega). */
export interface CanalVendas {
    readonly quantidade: number;
    readonly total: number;
}

/** @brief Repasse de gorjeta/taxa de serviço devido a um garçom ou entregador —
 * o valor exato que não é faturamento da pizzaria, e sim dinheiro que
 * volta para quem atendeu o pedido. */
export interface RepasseFuncionario {
    readonly funcionarioId: number;
    readonly nome: string;
    readonly profissao: string | null;
    readonly totalGorjetas: number;
    readonly quantidadePedidos: number;
}

/** @brief Relatório gerencial de vendas de um período: totais, repasses, mais vendidos e canais de venda. */
export interface RelatorioVendas {
    readonly periodo: {
        readonly inicio: string | null;
        readonly fim: string | null;
    };
    readonly totalPedidos: number;
    readonly totalVendas: number;
    /** Soma de todas as gorjetas/taxas de serviço do período — esse valor
     * não é faturamento da pizzaria, é repassado aos funcionários. */
    readonly totalGorjetas: number;
    /** Faturamento que fica de fato com a pizzaria: totalVendas menos as
     * gorjetas/taxas de serviço repassadas aos funcionários. */
    readonly faturamentoLoja: number;
    /** Repasse devido a cada garçom/entregador no período. */
    readonly repasses: readonly RepasseFuncionario[];
    readonly maisVendidoPizza: ItemMaisVendido | null;
    readonly maisVendidoBebida: ItemMaisVendido | null;
    readonly maisVendidoCombo: ItemMaisVendido | null;
    readonly presencial: CanalVendas;
    readonly entrega: CanalVendas;
}

/** @brief Períodos de busca exigidos: dia, semana, mês e ano — cada um com um
 * atalho para o período "atual" (hoje / esta semana / este mês / este ano). */
export type PeriodoRelatorio = 'dia' | 'semana' | 'mes' | 'ano';
