import type { ComandaApi } from '../types/comanda';

async function requisicao<T>(url: string, init?: RequestInit): Promise<T> {
    const resposta = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });

    const dados = (await resposta.json().catch(() => ({}))) as T & { erro?: string };

    if (!resposta.ok) {
        throw new Error(dados.erro ?? `Erro HTTP ${resposta.status}`);
    }

    return dados;
}

export function abrirComanda(mesa: number): Promise<ComandaApi> {
    return requisicao<ComandaApi>('/api/comandas', {
        method: 'POST',
        body: JSON.stringify({ mesa }),
    });
}

export function listarComandas(mesa?: number): Promise<ComandaApi[]> {
    const query = mesa !== undefined ? `?mesa=${mesa}` : '';
    return requisicao<ComandaApi[]>(`/api/comandas${query}`);
}

export function pagarComanda(comandaId: string, formaPagamento: string): Promise<ComandaApi> {
    return requisicao<ComandaApi>(`/api/comandas/${encodeURIComponent(comandaId)}/pagar`, {
        method: 'PATCH',
        body: JSON.stringify({ formaPagamento }),
    });
}

export function finalizarMesa(mesa: number): Promise<{ mesa: number; comandasEncerradas: number }> {
    return requisicao(`/api/mesas/${mesa}/finalizar`, { method: 'POST' });
}
