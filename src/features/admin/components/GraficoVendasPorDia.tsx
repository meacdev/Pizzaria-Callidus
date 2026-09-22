/**
 * @file GraficoVendasPorDia.tsx
 * @brief Gráfico de linha (SVG) com o total vendido por dia no período do relatório gerencial.
 *
 * @details
 * Série única (magnitude ao longo do tempo), por isso usa um único tom
 * (a cor de marca `--primary`) em vez de uma paleta categórica — não há
 * identidade a distinguir, só a tendência. Mostra um crosshair com
 * tooltip ao passar o mouse/tocar, conforme a orientação de interação
 * padrão para gráficos de linha (veja a skill de dataviz do projeto).
 */
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { VendasDoDia } from '../types/relatorio';

const LARGURA = 720;
const ALTURA = 220;
const MARGEM = { topo: 16, direita: 16, baixo: 28, esquerda: 16 };

const Container = styled.div`
    position: relative;
    width: 100%;
`;

const Svg = styled.svg`
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
`;

const Tooltip = styled.div<{ $x: number; $y: number }>`
    position: absolute;
    left: ${({ $x }) => $x}%;
    top: ${({ $y }) => $y}%;
    transform: translate(-50%, -115%);
    pointer-events: none;
    background: #1a0d0a;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    padding: 0.5rem 0.7rem;
    color: #fff;
    font-size: 0.78rem;
    white-space: nowrap;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
    z-index: 3;

    strong {
        display: block;
        font-size: 0.85rem;
        color: #ff8f8f;
    }
`;

const Vazio = styled.div`
    min-height: 140px;
    display: grid;
    place-items: center;
    color: #d7c9c4;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    text-align: center;
`;

/** @brief Formata um valor em reais (BRL), sem casas decimais quando exato. */
function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

/** @brief Formata uma data "AAAA-MM-DD" como "dd/mm" para o rótulo do eixo/tooltip. */
function formatarDiaCurto(data: string): string {
    const [, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
}

/** @brief Props do componente {@link GraficoVendasPorDia}. */
interface GraficoVendasPorDiaProps {
    /** Série diária do relatório (@see RelatorioVendas.serieDiaria), em ordem cronológica. */
    readonly serie: readonly VendasDoDia[];
}

/** @brief Gráfico de linha com o total vendido por dia, com crosshair e tooltip ao passar o mouse. */
export function GraficoVendasPorDia({ serie }: GraficoVendasPorDiaProps) {
    const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null);

    const areaUtil = LARGURA - MARGEM.esquerda - MARGEM.direita;
    const alturaUtil = ALTURA - MARGEM.topo - MARGEM.baixo;
    const maiorTotal = Math.max(1, ...serie.map((dia) => dia.total));

    const pontos = useMemo(
        () =>
            serie.map((dia, indice) => {
                const x =
                    serie.length === 1
                        ? MARGEM.esquerda + areaUtil / 2
                        : MARGEM.esquerda + (indice / (serie.length - 1)) * areaUtil;
                const y = MARGEM.topo + alturaUtil - (dia.total / maiorTotal) * alturaUtil;
                return { ...dia, x, y };
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [serie, maiorTotal],
    );

    if (serie.length === 0) {
        return <Vazio>Sem vendas registradas nesse período.</Vazio>;
    }

    const linha = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(' ');
    const area = `${MARGEM.esquerda},${MARGEM.topo + alturaUtil} ${linha} ${
        pontos[pontos.length - 1].x
    },${MARGEM.topo + alturaUtil}`;

    /** @brief Encontra o ponto mais próximo do mouse no eixo X e o define como ativo (para o crosshair/tooltip). */
    function aoMoverMouse(evento: React.MouseEvent<SVGSVGElement>) {
        const retangulo = evento.currentTarget.getBoundingClientRect();
        const xRelativo = ((evento.clientX - retangulo.left) / retangulo.width) * LARGURA;
        let maisProximo = 0;
        let menorDistancia = Infinity;
        pontos.forEach((ponto, indice) => {
            const distancia = Math.abs(ponto.x - xRelativo);
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                maisProximo = indice;
            }
        });
        setIndiceAtivo(maisProximo);
    }

    // Mostra no máximo ~7 rótulos no eixo X, para não sobrepor texto quando o período tem muitos dias.
    const passoRotulo = Math.max(1, Math.ceil(pontos.length / 7));
    const pontoAtivo = indiceAtivo !== null ? pontos[indiceAtivo] : null;

    return (
        <Container>
            <Svg
                viewBox={`0 0 ${LARGURA} ${ALTURA}`}
                role="img"
                aria-label="Gráfico de linha com o total vendido por dia no período"
                onMouseMove={aoMoverMouse}
                onMouseLeave={() => setIndiceAtivo(null)}
            >
                {/* Linha de base (eixo), recessiva. */}
                <line
                    x1={MARGEM.esquerda}
                    y1={MARGEM.topo + alturaUtil}
                    x2={LARGURA - MARGEM.direita}
                    y2={MARGEM.topo + alturaUtil}
                    stroke="rgba(255,255,255,0.14)"
                />

                <polygon points={area} fill="rgba(255, 42, 42, 0.14)" stroke="none" />
                <polyline points={linha} fill="none" stroke="#ff2a2a" strokeWidth={2} strokeLinejoin="round" />

                {pontos.map((ponto, indice) => (
                    <circle
                        key={ponto.data}
                        cx={ponto.x}
                        cy={ponto.y}
                        r={indice === indiceAtivo ? 5 : 3}
                        fill="#ff2a2a"
                        stroke="#1a0d0a"
                        strokeWidth={1.5}
                    />
                ))}

                {pontoAtivo && (
                    <line
                        x1={pontoAtivo.x}
                        y1={MARGEM.topo}
                        x2={pontoAtivo.x}
                        y2={MARGEM.topo + alturaUtil}
                        stroke="rgba(255,255,255,0.25)"
                        strokeDasharray="3 3"
                    />
                )}

                {pontos.map((ponto, indice) =>
                    indice % passoRotulo === 0 || indice === pontos.length - 1 ? (
                        <text
                            key={`rotulo-${ponto.data}`}
                            x={ponto.x}
                            y={ALTURA - 8}
                            textAnchor="middle"
                            fontSize={10}
                            fill="#d7c9c4"
                        >
                            {formatarDiaCurto(ponto.data)}
                        </text>
                    ) : null,
                )}
            </Svg>

            {pontoAtivo && (
                <Tooltip $x={(pontoAtivo.x / LARGURA) * 100} $y={(pontoAtivo.y / ALTURA) * 100}>
                    <strong>{formatarPreco(pontoAtivo.total)}</strong>
                    {formatarDiaCurto(pontoAtivo.data)} · {pontoAtivo.pedidos} pedido(s)
                </Tooltip>
            )}
        </Container>
    );
}
