import type { NovaReservaInput, Reserva, StatusReserva } from '../types/reserva';

const BASE_URL = '/api';

interface ErroApi {
    erro?: string;
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const mensagem = (dados as ErroApi | null)?.erro ?? 'Não foi possível completar a operação.';
        throw new Error(mensagem);
    }

    return dados as T;
}

export async function criarReserva(dados: NovaReservaInput): Promise<Reserva> {
    const resposta = await fetch(`${BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Reserva>(resposta);
}

interface FiltroReservas {
    readonly clienteId?: number;
    readonly mesa?: number;
    readonly data?: string;
}

export async function listarReservas(filtro?: FiltroReservas): Promise<Reserva[]> {
    const query = new URLSearchParams();
    if (filtro?.clienteId != null) query.set('clienteId', String(filtro.clienteId));
    if (filtro?.mesa != null) query.set('mesa', String(filtro.mesa));
    if (filtro?.data) query.set('data', filtro.data);

    const queryString = query.toString();
    const resposta = await fetch(`${BASE_URL}/reservas${queryString ? `?${queryString}` : ''}`);
    return tratarResposta<Reserva[]>(resposta);
}

export async function atualizarStatusReserva(id: string, status: StatusReserva): Promise<Reserva> {
    const resposta = await fetch(`${BASE_URL}/reservas/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });

    return tratarResposta<Reserva>(resposta);
}
