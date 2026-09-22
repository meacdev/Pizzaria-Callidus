/**
 * @file relatorioPdf.utils.ts
 * @brief Geração do relatório gerencial de vendas em PDF, a partir dos dados calculados pelo back-end.
 *
 * @details
 * @see relatorio.ts para o formato dos dados (@see RelatorioVendas) e
 * @see periodo.utils.ts para os rótulos de período usados no cabeçalho.
 */
import { jsPDF } from 'jspdf';
import type { RelatorioVendas } from '../types/relatorio';
import type { PeriodoRelatorio } from '../types/relatorio';
import { PERIODO_LABEL } from './periodo.utils';

/** @brief Formata uma data como data curta em pt-BR (ex.: "11/09/2026"). */
function formatarData(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(data);
}

/** @brief Formata um valor numérico como moeda BRL. */
function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

/**
 * @brief Gera e baixa o relatório gerencial de vendas em PDF a partir dos dados
 * já calculados pelo back-end (GET /api/relatorios/vendas).
 * @param relatorio Dados já calculados do relatório de vendas.
 * @param periodo Tipo de período do relatório (dia/semana/mês/ano), usado no cabeçalho.
 * @param inicio Data de início do período.
 * @param fim Data de fim do período.
 */
export function gerarRelatorioVendasPdf(
    relatorio: RelatorioVendas,
    periodo: PeriodoRelatorio,
    inicio: Date,
    fim: Date,
): void {
    const doc = new jsPDF();
    const margemEsquerda = 18;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Pizzaria Callidus — Relatório Gerencial de Vendas', margemEsquerda, y);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(
        `Período: ${PERIODO_LABEL[periodo]} — ${formatarData(inicio)} a ${formatarData(fim)}`,
        margemEsquerda,
        y,
    );
    y += 6;
    doc.text(`Gerado em: ${formatarData(new Date())}`, margemEsquerda, y);
    y += 10;

    doc.setDrawColor(200);
    doc.line(margemEsquerda, y, 192, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Resumo do período', margemEsquerda, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const linhasResumo = [
        `Total de pedidos: ${relatorio.totalPedidos}`,
        `Total em vendas: ${formatarPreco(relatorio.totalVendas)}`,
    ];
    for (const linha of linhasResumo) {
        doc.text(linha, margemEsquerda, y);
        y += 7;
    }
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Fechamento financeiro — faturamento x repasses', margemEsquerda, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Faturamento da pizzaria: ${formatarPreco(relatorio.faturamentoLoja)}`, margemEsquerda, y);
    y += 7;
    doc.text(
        `Repasses (gorjeta/taxa de serviço) a garçons e entregadores: ${formatarPreco(relatorio.totalGorjetas)}`,
        margemEsquerda,
        y,
    );
    y += 7;

    if (relatorio.repasses.length === 0) {
        doc.text('Nenhum repasse a funcionário identificado no período.', margemEsquerda, y);
        y += 7;
    } else {
        for (const repasse of relatorio.repasses) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(
                `  • ${repasse.nome}: ${formatarPreco(repasse.totalGorjetas)} (${repasse.quantidadePedidos} pedido(s))`,
                margemEsquerda,
                y,
            );
            y += 7;
        }
    }
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Mais vendidos', margemEsquerda, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const maisVendidos: Array<[string, RelatorioVendas['maisVendidoPizza']]> = [
        ['Pizza', relatorio.maisVendidoPizza],
        ['Refrigerante', relatorio.maisVendidoBebida],
        ['Combo', relatorio.maisVendidoCombo],
    ];
    for (const [categoria, item] of maisVendidos) {
        const texto = item
            ? `${categoria}: ${item.nome} (${item.quantidade} unidade${item.quantidade === 1 ? '' : 's'} vendida${item.quantidade === 1 ? '' : 's'})`
            : `${categoria}: sem vendas no período`;
        doc.text(texto, margemEsquerda, y);
        y += 7;
    }
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Presencial x Entrega', margemEsquerda, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const totalCanais = relatorio.presencial.quantidade + relatorio.entrega.quantidade;
    const percentualPresencial = totalCanais > 0 ? (relatorio.presencial.quantidade / totalCanais) * 100 : 0;
    const percentualEntrega = totalCanais > 0 ? (relatorio.entrega.quantidade / totalCanais) * 100 : 0;

    doc.text(
        `Presencial (totem/balcão): ${relatorio.presencial.quantidade} pedido(s) — ${formatarPreco(relatorio.presencial.total)} (${percentualPresencial.toFixed(1)}%)`,
        margemEsquerda,
        y,
    );
    y += 7;
    doc.text(
        `Entrega (site): ${relatorio.entrega.quantidade} pedido(s) — ${formatarPreco(relatorio.entrega.total)} (${percentualEntrega.toFixed(1)}%)`,
        margemEsquerda,
        y,
    );
    y += 7;

    const conclusao =
        totalCanais === 0
            ? 'Sem pedidos suficientes no período para comparar os canais.'
            : percentualPresencial >= percentualEntrega
              ? 'Neste período, a loja vendeu mais presencialmente do que por entrega.'
              : 'Neste período, a loja vendeu mais por entrega do que presencialmente.';
    y += 3;
    doc.setFont('helvetica', 'italic');
    doc.text(conclusao, margemEsquerda, y);

    const nomeArquivo = `relatorio-vendas-${periodo}-${inicio.toISOString().slice(0, 10)}.pdf`;
    doc.save(nomeArquivo);
}
