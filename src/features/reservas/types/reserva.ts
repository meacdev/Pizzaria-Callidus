/**
 * @file reserva.ts
 * @brief Tipos do domínio de reservas de mesa (status, reserva e input de criação).
 *
 * @details
 * Usados por @see reserva.service.ts, pela área do cliente
 * (@see ReservarMesaPage) e pelo painel de funcionários (@see ReservasPage).
 */

/** @brief Status possíveis de uma reserva de mesa. */
export type StatusReserva = 'pendente' | 'confirmada' | 'cancelada';

/** @brief Rótulos em português para cada @see StatusReserva, prontos para exibição. */
export const STATUS_RESERVA_LABEL: Record<StatusReserva, string> = {
    pendente: 'Aguardando confirmação',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
};

/** @brief Reserva de mesa persistida, retornada pela API. */
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

/** @brief Dados necessários para criar uma nova reserva (@see criarReserva). */
export interface NovaReservaInput {
    readonly clienteId?: number | null;
    readonly nome: string;
    readonly telefone: string;
    readonly mesa: number;
    readonly pessoas: number;
    readonly dataHora: string;
}
