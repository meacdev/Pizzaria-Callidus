/**
 * @file comanda.service.ts
 * @brief Serviço de acesso às comandas de mesa (abrir, listar, pagar) e ao encerramento de mesa.
 *
 * @details
 * Usado pelo painel do balcão/garçom (@see BalcaoPage.tsx) para lançar
 * pedidos numa mesa e controlar o pagamento de cada comanda aberta.
 */
import type { ComandaApi } from '../types/comanda';

/** @brief Faz uma requisição JSON à API e lança erro com a mensagem do back-end quando a resposta não é ok. */
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

/** @brief Abre uma nova comanda para a mesa informada. @param mesa Número da mesa. @return A comanda criada. */
export function abrirComanda(mesa: number): Promise<ComandaApi> {
    return requisicao<ComandaApi>('/api/comandas', {
        method: 'POST',
        body: JSON.stringify({ mesa }),
    });
}

/** @brief Lista as comandas, opcionalmente filtradas por mesa. @param mesa Número da mesa (opcional). @return Comandas encontradas. */
export function listarComandas(mesa?: number): Promise<ComandaApi[]> {
    const query = mesa !== undefined ? `?mesa=${mesa}` : '';
    return requisicao<ComandaApi[]>(`/api/comandas${query}`);
}

/**
 * @brief Registra o pagamento de uma comanda.
 * @param comandaId Id da comanda paga.
 * @param formaPagamento Forma de pagamento usada (dinheiro, cartão, pix).
 * @return A comanda atualizada, já marcada como paga.
 */
export function pagarComanda(comandaId: string, formaPagamento: string): Promise<ComandaApi> {
    return requisicao<ComandaApi>(`/api/comandas/${encodeURIComponent(comandaId)}/pagar`, {
        method: 'PATCH',
        body: JSON.stringify({ formaPagamento }),
    });
}

/**
 * @brief Finaliza uma mesa, encerrando as comandas já pagas.
 * @param mesa Número da mesa a finalizar.
 * @return A mesa finalizada e a quantidade de comandas encerradas.
 */
export function finalizarMesa(mesa: number): Promise<{ mesa: number; comandasEncerradas: number }> {
    return requisicao(`/api/mesas/${mesa}/finalizar`, { method: 'POST' });
}
