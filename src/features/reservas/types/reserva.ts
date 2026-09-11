export type StatusReserva = 'pendente' | 'confirmada' | 'cancelada';

export const STATUS_RESERVA_LABEL: Record<StatusReserva, string> = {
    pendente: 'Aguardando confirmação',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
};

export interface Reserva {
    readonly id: string;
    readonly clienteId: number | null;
    readonly nome: string;
    readonly telefone: string;
    readonly mesa: number;
    readonly pessoas: number;
    readonly dataHora: string;
    readonly status: StatusReserva;
    readonly criadaEm: string;
}

export interface NovaReservaInput {
    readonly clienteId?: number | null;
    readonly nome: string;
    readonly telefone: string;
    readonly mesa: number;
    readonly pessoas: number;
    readonly dataHora: string;
}
