/**
 * @file rastreamento.ts
 * @brief Formato de uma linha do rastreamento de pedidos (quem fez, preparou e entregou/atendeu).
 *
 * @details
 * @see RastreamentoPedidos.tsx e rastreamento.service.ts, que consome a API correspondente.
 */

/** @brief Dados de rastreamento de um pedido: cliente, cozinheiro e responsável por entrega/atendimento. */
export interface LinhaRastreamento {
    readonly pedidoId: string;
    readonly status: string;
    readonly origem: string | null;
    readonly mesa: number | null;
    readonly criadoEm: string;
    readonly atualizadoEm: string;
    readonly clienteId: number | null;
    readonly clienteNome: string;
    readonly cozinheiroId: number | null;
    readonly cozinheiroNome: string | null;
    readonly responsavelId: number | null;
    readonly responsavelNome: string | null;
    readonly responsavelProfissao: string | null;
    readonly total: number;
}
