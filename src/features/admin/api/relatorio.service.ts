/**
 * @file relatorio.service.ts
 * @brief Serviço de consulta do relatório de vendas no painel administrativo.
 */
import type { RelatorioVendas } from '../types/relatorio';

/**
 * @brief Busca o relatório de vendas em um intervalo de datas.
 * @param inicio Data/hora inicial do período.
 * @param fim Data/hora final do período.
 * @return O relatório de vendas do período informado.
 */
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
