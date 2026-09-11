import { useState } from 'react';
import styled from 'styled-components';
import { PainelLayout } from '../../funcionarios/components/PainelLayout';
import { useFuncionarioAuth } from '../../funcionarios/context/FuncionarioAuthContext';
import { buscarRelatorioVendas } from '../api/relatorio.service';
import { intervaloPeriodoAtual, PERIODO_LABEL } from '../utils/periodo.utils';
import { gerarRelatorioVendasPdf } from '../utils/relatorioPdf.utils';
import { FechamentoDiarioModal } from '../components/FechamentoDiarioModal';
import type { PeriodoRelatorio, RelatorioVendas } from '../types/relatorio';

const PERIODOS: PeriodoRelatorio[] = ['dia', 'semana', 'mes', 'ano'];

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
`;

const Cabecalho = styled.div`
    padding: 1.75rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    background: linear-gradient(145deg, #281410, rgba(58, 28, 21, 0.82));
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
`;

const Titulo = styled.h2`
    margin: 0;
    font-size: clamp(1.45rem, 2.5vw, 2rem);
    color: #fff;
    letter-spacing: -0.02em;
`;

const Descricao = styled.p`
    margin: 0.55rem 0 0;
    color: #d7c9c4;
    line-height: 1.55;
    max-width: 850px;
`;

const Erro = styled.p`
    margin: 1rem 0 0;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(230, 0, 0, 0.3);
    border-radius: 12px;
    background: rgba(230, 0, 0, 0.09);
    color: #ffb0b0;
`;

const Secao = styled.section`
    min-width: 0;
`;

const CabecalhoSecao = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
    flex-wrap: wrap;

    h2 {
        margin: 0;
        font-size: 1.35rem;
        color: #fff;
    }

    span {
        color: #d7c9c4;
        font-size: 0.88rem;
    }
`;

const Filtros = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    padding: 1.35rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: #281410;
`;

const LinhaFiltro = styled.div`
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
`;

const BotaoPeriodo = styled.button<{ $ativo: boolean }>`
    min-height: 42px;
    border-radius: 10px;
    padding: 0.62rem 1.1rem;
    font-weight: 700;
    font-size: 0.9rem;
    border: 1px solid ${({ $ativo }) => ($ativo ? '#ff2a2a' : 'rgba(255, 255, 255, 0.16)')};
    background: ${({ $ativo }) => ($ativo ? '#ff2a2a' : 'transparent')};
    color: #fff;
    transition: all 0.15s ease;

    &:hover {
        border-color: #ff5c5c;
    }
`;

const LinhaDatas = styled.div`
    display: flex;
    gap: 0.9rem;
    flex-wrap: wrap;
    align-items: flex-end;
`;

const CampoData = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.82rem;
    color: #d7c9c4;
    font-weight: 600;

    input {
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        border-radius: 8px;
        padding: 0.55rem 0.75rem;
        font-size: 0.9rem;
        color: #fff;
        background: #1a0d0a;
        color-scheme: dark;
    }
`;

const BotaoAtualizar = styled.button`
    min-height: 42px;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.68rem 1.25rem;
    font-weight: 800;
    background: #3a1c15;
    color: #fff;

    &:hover:not(:disabled) {
        background: #47231a;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Resumo = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
`;

const Indicador = styled.div`
    min-height: 105px;
    padding: 1.15rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    background: #281410;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const IndicadorLabel = styled.span`
    color: #d7c9c4;
    font-size: 0.86rem;
    font-weight: 700;
`;

const IndicadorValor = styled.strong`
    margin-top: 0.35rem;
    font-size: 1.85rem;
    line-height: 1;
    color: #fff;
`;

const Lista = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
`;

const Card = styled.article`
    min-width: 0;
    padding: 1.15rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: #281410;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
`;

const CardTitulo = styled.strong`
    display: block;
    color: #d7c9c4;
    font-size: 0.82rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
`;

const CardNome = styled.p`
    margin: 0;
    color: #fff;
    font-size: 1.15rem;
    font-weight: 800;
`;

const CardQuantidade = styled.p`
    margin: 0.3rem 0 0;
    color: #d7c9c4;
    font-size: 0.88rem;
`;

const BarraComparativo = styled.div`
    display: flex;
    height: 14px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
    margin: 0.9rem 0;
`;

const SegmentoBarra = styled.div<{ $percentual: number; $cor: string }>`
    width: ${({ $percentual }) => $percentual}%;
    background: ${({ $cor }) => $cor};
    transition: width 0.3s ease;
`;

const LegendaComparativo = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    color: #d7c9c4;
    font-size: 0.88rem;

    strong {
        color: #fff;
    }
`;

const BotaoPdf = styled.button`
    min-height: 46px;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.8rem 1.4rem;
    font-weight: 800;
    font-size: 0.95rem;
    background: #ff2a2a;
    color: #fff;

    &:hover:not(:disabled) {
        background: #ff5c5c;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Vazio = styled.div`
    min-height: 86px;
    padding: 1.4rem;
    display: grid;
    place-items: center;
    color: #d7c9c4;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    text-align: center;
    background: rgba(0, 0, 0, 0.08);
`;

function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function paraInputData(data: Date): string {
    return data.toISOString().slice(0, 10);
}

export function GerentePage() {
    const { funcionario } = useFuncionarioAuth();

    const [periodo, setPeriodo] = useState<PeriodoRelatorio>('dia');
    const intervaloInicial = intervaloPeriodoAtual('dia');
    const [inicio, setInicio] = useState<Date>(intervaloInicial.inicio);
    const [fim, setFim] = useState<Date>(intervaloInicial.fim);
    const [relatorio, setRelatorio] = useState<RelatorioVendas | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [fechamentoAberto, setFechamentoAberto] = useState(true);

    async function carregarRelatorio(inicioConsulta: Date, fimConsulta: Date) {
        setCarregando(true);
        try {
            setRelatorio(await buscarRelatorioVendas(inicioConsulta, fimConsulta));
            setErro('');
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível carregar o relatório.');
        } finally {
            setCarregando(false);
        }
    }

    function selecionarPeriodoAtual(novoPeriodo: PeriodoRelatorio) {
        setPeriodo(novoPeriodo);
        const { inicio: novoInicio, fim: novoFim } = intervaloPeriodoAtual(novoPeriodo);
        setInicio(novoInicio);
        setFim(novoFim);
        void carregarRelatorio(novoInicio, novoFim);
    }

    function alterarDataInicio(valor: string) {
        if (!valor) return;
        const novaData = new Date(`${valor}T00:00:00`);
        setInicio(novaData);
    }

    function alterarDataFim(valor: string) {
        if (!valor) return;
        const novaData = new Date(`${valor}T23:59:59`);
        setFim(novaData);
    }

    function buscarComDatasAtuais() {
        void carregarRelatorio(inicio, fim);
    }

    function baixarPdf() {
        if (!relatorio) return;
        gerarRelatorioVendasPdf(relatorio, periodo, inicio, fim);
    }

    const totalCanais = relatorio ? relatorio.presencial.quantidade + relatorio.entrega.quantidade : 0;
    const percentualPresencial = totalCanais > 0 ? (relatorio!.presencial.quantidade / totalCanais) * 100 : 0;
    const percentualEntrega = totalCanais > 0 ? (relatorio!.entrega.quantidade / totalCanais) * 100 : 0;

    return (
        <PainelLayout icone="📊" titulo="Painel Gerencial" tema="escuro">
            <Container>
                <Cabecalho>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <Titulo>Olá, {funcionario?.nome}!</Titulo>
                            <Descricao>
                                Acompanhe o desempenho de vendas da loja e gere relatórios gerenciais em PDF,
                                com filtro por dia, semana, mês ou ano.
                            </Descricao>
                        </div>
                        <BotaoAtualizar type="button" onClick={() => setFechamentoAberto(true)}>
                            📋 Fechamento do dia
                        </BotaoAtualizar>
                    </div>
                    {erro && (
                        <Erro role="alert">
                            <strong>Erro:</strong> {erro}
                        </Erro>
                    )}
                </Cabecalho>

                <Secao>
                    <CabecalhoSecao>
                        <h2>Relatório de vendas</h2>
                        <span>Escolha o período e gere o PDF</span>
                    </CabecalhoSecao>

                    <Filtros>
                        <LinhaFiltro>
                            {PERIODOS.map((opcao) => (
                                <BotaoPeriodo
                                    key={opcao}
                                    type="button"
                                    $ativo={periodo === opcao}
                                    onClick={() => selecionarPeriodoAtual(opcao)}
                                >
                                    {PERIODO_LABEL[opcao]} atual
                                </BotaoPeriodo>
                            ))}
                        </LinhaFiltro>

                        <LinhaDatas>
                            <CampoData>
                                Data inicial
                                <input
                                    type="date"
                                    value={paraInputData(inicio)}
                                    onChange={(evento) => alterarDataInicio(evento.target.value)}
                                />
                            </CampoData>
                            <CampoData>
                                Data final
                                <input
                                    type="date"
                                    value={paraInputData(fim)}
                                    onChange={(evento) => alterarDataFim(evento.target.value)}
                                />
                            </CampoData>
                            <BotaoAtualizar type="button" disabled={carregando} onClick={buscarComDatasAtuais}>
                                {carregando ? 'Buscando...' : 'Buscar período'}
                            </BotaoAtualizar>
                        </LinhaDatas>
                    </Filtros>
                </Secao>

                <Secao>
                    <CabecalhoSecao>
                        <h2>Resultado do período</h2>
                        {relatorio && <span>{relatorio.totalPedidos} pedido(s) no período</span>}
                    </CabecalhoSecao>

                    {!relatorio ? (
                        <Vazio>Escolha um período acima para carregar o relatório.</Vazio>
                    ) : (
                        <>
                            <Resumo>
                                <Indicador>
                                    <IndicadorLabel>Total de pedidos</IndicadorLabel>
                                    <IndicadorValor>{relatorio.totalPedidos}</IndicadorValor>
                                </Indicador>
                                <Indicador>
                                    <IndicadorLabel>Total em vendas</IndicadorLabel>
                                    <IndicadorValor>{formatarPreco(relatorio.totalVendas)}</IndicadorValor>
                                </Indicador>
                            </Resumo>

                            <div style={{ marginTop: '1.5rem' }}>
                                <CabecalhoSecao>
                                    <h2 style={{ fontSize: '1.1rem' }}>Mais vendidos</h2>
                                </CabecalhoSecao>
                                <Lista>
                                    <Card>
                                        <CardTitulo>🍕 Pizza mais vendida</CardTitulo>
                                        {relatorio.maisVendidoPizza ? (
                                            <>
                                                <CardNome>{relatorio.maisVendidoPizza.nome}</CardNome>
                                                <CardQuantidade>
                                                    {relatorio.maisVendidoPizza.quantidade} unidade(s) vendida(s)
                                                </CardQuantidade>
                                            </>
                                        ) : (
                                            <CardQuantidade>Sem vendas no período</CardQuantidade>
                                        )}
                                    </Card>
                                    <Card>
                                        <CardTitulo>🥤 Refrigerante mais vendido</CardTitulo>
                                        {relatorio.maisVendidoBebida ? (
                                            <>
                                                <CardNome>{relatorio.maisVendidoBebida.nome}</CardNome>
                                                <CardQuantidade>
                                                    {relatorio.maisVendidoBebida.quantidade} unidade(s) vendida(s)
                                                </CardQuantidade>
                                            </>
                                        ) : (
                                            <CardQuantidade>Sem vendas no período</CardQuantidade>
                                        )}
                                    </Card>
                                    <Card>
                                        <CardTitulo>🍱 Combo mais vendido</CardTitulo>
                                        {relatorio.maisVendidoCombo ? (
                                            <>
                                                <CardNome>{relatorio.maisVendidoCombo.nome}</CardNome>
                                                <CardQuantidade>
                                                    {relatorio.maisVendidoCombo.quantidade} unidade(s) vendida(s)
                                                </CardQuantidade>
                                            </>
                                        ) : (
                                            <CardQuantidade>Sem vendas no período</CardQuantidade>
                                        )}
                                    </Card>
                                </Lista>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <CabecalhoSecao>
                                    <h2 style={{ fontSize: '1.1rem' }}>Presencial x Entrega</h2>
                                </CabecalhoSecao>
                                <Card>
                                    {totalCanais === 0 ? (
                                        <CardQuantidade>Sem pedidos suficientes no período.</CardQuantidade>
                                    ) : (
                                        <>
                                            <BarraComparativo>
                                                <SegmentoBarra $percentual={percentualPresencial} $cor="#ff2a2a" />
                                                <SegmentoBarra $percentual={percentualEntrega} $cor="#4299e1" />
                                            </BarraComparativo>
                                            <LegendaComparativo>
                                                <span>
                                                    🏪 Presencial: <strong>{percentualPresencial.toFixed(1)}%</strong>{' '}
                                                    ({relatorio.presencial.quantidade} pedidos,{' '}
                                                    {formatarPreco(relatorio.presencial.total)})
                                                </span>
                                                <span>
                                                    🛵 Entrega: <strong>{percentualEntrega.toFixed(1)}%</strong>{' '}
                                                    ({relatorio.entrega.quantidade} pedidos,{' '}
                                                    {formatarPreco(relatorio.entrega.total)})
                                                </span>
                                            </LegendaComparativo>
                                        </>
                                    )}
                                </Card>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <BotaoPdf type="button" onClick={baixarPdf}>
                                    📄 Gerar relatório em PDF
                                </BotaoPdf>
                            </div>
                        </>
                    )}
                </Secao>
            </Container>

            {fechamentoAberto && <FechamentoDiarioModal onFechar={() => setFechamentoAberto(false)} />}
        </PainelLayout>
    );
}
