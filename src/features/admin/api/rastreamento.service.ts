import type { LinhaRastreamento } from '../types/rastreamento';

export async function buscarRastreamentoPedidos(busca?: string): Promise<LinhaRastreamento[]> {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : '';
    const resposta = await fetch(`/api/pedidos/rastreamento${query}`);
    const dados = (await resposta.json().catch(() => ([]))) as LinhaRastreamento[] & { erro?: string };

    if (!resposta.ok) {
        throw new Error((dados as unknown as { erro?: string }).erro ?? `Erro HTTP ${resposta.status}`);
    }

    return dados;
}
