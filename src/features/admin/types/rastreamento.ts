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
