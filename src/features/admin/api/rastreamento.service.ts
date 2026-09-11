/**
 * @file rastreamento.service.ts
 * @brief Serviço de consulta do rastreamento de pedidos no painel administrativo.
 */
import type { LinhaRastreamento } from '../types/rastreamento';

/**
 * @brief Busca as linhas de rastreamento de pedidos, com filtro opcional de busca.
 * @param busca Termo opcional para filtrar os pedidos retornados.
 * @return A lista de linhas de rastreamento correspondentes.
 */
export async function buscarRastreamentoPedidos(busca?: string): Promise<LinhaRastreamento[]> {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : '';
    const resposta = await fetch(`/api/pedidos/rastreamento${query}`);
    const dados = (await resposta.json().catch(() => ([]))) as LinhaRastreamento[] & { erro?: string };

    if (!resposta.ok) {
        throw new Error((dados as unknown as { erro?: string }).erro ?? `Erro HTTP ${resposta.status}`);
    }

    return dados;
}
