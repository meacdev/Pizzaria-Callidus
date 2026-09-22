/**
 * @file GraficoTopPizzas.tsx
 * @brief Gráfico de barras horizontais (SVG) com o ranking das pizzas mais vendidas no período.
 *
 * @details
 * Série única (quantidade por pizza) — a identidade de cada barra já vem
 * do rótulo à esquerda, então usa um único tom de marca (`--primary`) em
 * vez de uma paleta categórica, com o valor sempre rotulado diretamente
 * ao final da barra (sem precisar de legenda).
 */
import styled from 'styled-components';
import type { ItemMaisVendido } from '../types/relatorio';

const Linha = styled.div`
    display: grid;
    grid-template-columns: minmax(90px, 160px) 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0;
`;

const Nome = styled.span`
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Trilho = styled.div`
    height: 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
`;

const Barra = styled.div<{ $percentual: number }>`
    height: 100%;
    width: ${({ $percentual }) => $percentual}%;
    min-width: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff2a2a, #ff5c5c);
    transition: width 0.3s ease;
`;

const Valor = styled.span`
    color: #d7c9c4;
    font-size: 0.82rem;
    font-weight: 700;
    min-width: 60px;
    text-align: right;
`;

const Vazio = styled.div`
    min-height: 90px;
    display: grid;
    place-items: center;
    color: #d7c9c4;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    text-align: center;
`;

/** @brief Props do componente {@link GraficoTopPizzas}. */
interface GraficoTopPizzasProps {
    /** Ranking de pizzas mais vendidas (@see RelatorioVendas.topPizzas), da mais para a menos vendida. */
    readonly itens: readonly ItemMaisVendido[];
}

/** @brief Gráfico de barras horizontais com o ranking das pizzas mais vendidas no período, com valor rotulado em cada barra. */
export function GraficoTopPizzas({ itens }: GraficoTopPizzasProps) {
    if (itens.length === 0) {
        return <Vazio>Sem vendas de pizza nesse período.</Vazio>;
    }

    const maiorQuantidade = Math.max(...itens.map((item) => item.quantidade));

    return (
        <div>
            {itens.map((item) => (
                <Linha key={item.nome} title={`${item.nome}: ${item.quantidade} unidade(s)`}>
                    <Nome>{item.nome}</Nome>
                    <Trilho>
                        <Barra $percentual={(item.quantidade / maiorQuantidade) * 100} />
                    </Trilho>
                    <Valor>{item.quantidade} un.</Valor>
                </Linha>
            ))}
        </div>
    );
}
