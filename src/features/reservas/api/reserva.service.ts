/**
 * @file reserva.service.ts
 * @brief Cliente da API de reservas de mesa (criar, listar e atualizar status).
 *
 * @details
 * Usado pela área do cliente (@see ReservarMesaPage) para criar reservas e
 * pelo painel de funcionários (@see ReservasPage) para listá-las e
 * confirmar/cancelar (@see reserva.ts para os tipos).
 */
import type { NovaReservaInput, Reserva, StatusReserva } from '../types/reserva';

const BASE_URL = '/api';

/** @brief Formato de erro retornado pela API em respostas malsucedidas. */
interface ErroApi {
    erro?: string;
}

/**
 * @brief Converte uma `Response` do fetch em dados tipados, lançando erro quando a resposta não é `ok`.
 * @param resposta Resposta bruta do `fetch`.
 * @return Corpo da resposta já convertido em JSON e tipado como `T`.
 */
async function tratarResposta<T>(resposta: Response): Promise<T> {
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const mensagem = (dados as ErroApi | null)?.erro ?? 'Não foi possível completar a operação.';
        throw new Error(mensagem);
    }

    return dados as T;
}

/**
 * @brief Cria uma nova reserva de mesa.
 * @param dados Dados da reserva a ser criada.
 * @return A reserva criada, já com id e status inicial.
 */
export async function criarReserva(dados: NovaReservaInput): Promise<Reserva> {
    const resposta = await fetch(`${BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    });

    return tratarResposta<Reserva>(resposta);
}

/** @brief Filtros opcionais para @see listarReservas. */
interface FiltroReservas {
    readonly clienteId?: number;
    readonly mesa?: number;
    readonly data?: string;
}

/**
 * @brief Lista reservas, opcionalmente filtradas por cliente, mesa e/ou data.
 * @param filtro Filtros opcionais a aplicar na busca.
 * @return Lista de reservas que atendem ao filtro informado.
 */
export async function listarReservas(filtro?: FiltroReservas): Promise<Reserva[]> {
    const query = new URLSearchParams();
    if (filtro?.clienteId != null) query.set('clienteId', String(filtro.clienteId));
    if (filtro?.mesa != null) query.set('mesa', String(filtro.mesa));
    if (filtro?.data) query.set('data', filtro.data);

    const queryString = query.toString();
    const resposta = await fetch(`${BASE_URL}/reservas${queryString ? `?${queryString}` : ''}`);
    return tratarResposta<Reserva[]>(resposta);
}

/**
 * @brief Atualiza o status de uma reserva (ex.: confirmar ou cancelar).
 * @param id Id da reserva a atualizar.
 * @param status Novo status da reserva.
 * @return A reserva já com o status atualizado.
 */
export async function atualizarStatusReserva(id: string, status: StatusReserva): Promise<Reserva> {
    const resposta = await fetch(`${BASE_URL}/reservas/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });

    return tratarResposta<Reserva>(resposta);
}
