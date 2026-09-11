import type { RelatorioVendas } from '../types/relatorio';

export async function buscarRelatorioVendas(inicio: Date, fim: Date): Promise<RelatorioVendas> {
    const query = new URLSearchParams({
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
    });

    const resposta = await fetch(`/api/relatorios/vendas?${query.toString()}`);
    const dados = (await resposta.json().catch(() => ({}))) as RelatorioVendas & { erro?: string };

    if (!resposta.ok) {
        throw new Error(dados.erro ?? `Erro HTTP ${resposta.status}`);
    }

    return dados;
}
