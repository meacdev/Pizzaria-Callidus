import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ModalOverlay } from '../../funcionarios/components/ModalOverlay';
import { buscarRelatorioVendas } from '../api/relatorio.service';
import { intervaloPeriodoAtual } from '../utils/periodo.utils';
import type { RelatorioVendas } from '../types/relatorio';

function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

const Carregando = styled.p`
    color: #d7c9c4;
    text-align: center;
    padding: 1.5rem 0;
`;

const Erro = styled.p`
    margin: 0;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(230, 0, 0, 0.3);
    border-radius: 12px;
    background: rgba(230, 0, 0, 0.09);
    color: #ffb0b0;
`;

const Resumo = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
    margin-bottom: 1.25rem;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const Indicador = styled.div<{ $destaque?: boolean }>`
    min-height: 95px;
    padding: 1.1rem 1.2rem;
    border: 1px solid ${({ $destaque }) => ($destaque ? 'rgba(42, 200, 110, 0.4)' : 'rgba(255, 255, 255, 0.1)')};
    border-radius: 14px;
    background: ${({ $destaque }) => ($destaque ? 'rgba(42, 200, 110, 0.1)' : 'rgba(0, 0, 0, 0.13)')};
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const IndicadorLabel = styled.span`
    color: #d7c9c4;
    font-size: 0.82rem;
    font-weight: 700;
`;

const IndicadorValor = styled.strong`
    margin-top: 0.3rem;
    font-size: 1.55rem;
    line-height: 1;
    color: #fff;
`;

const TituloSecao = styled.p`
    margin: 0 0 0.7rem;
    font-weight: 800;
    font-size: 0.92rem;
    color: #fff;
`;

const ListaRepasses = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
`;

const LinhaRepasse = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.13);

    div.nome {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    div.nome strong {
        font-size: 0.9rem;
        color: #fff;
    }

    div.nome span {
        font-size: 0.76rem;
        color: #d7c9c4;
    }

    div.valor {
        font-weight: 800;
        color: #8df0b5;
        flex-shrink: 0;
    }
`;

const Vazio = styled.p`
    margin: 0;
    color: #d7c9c4;
    font-size: 0.88rem;
    text-align: center;
    padding: 1rem 0;
`;

const PROFISSAO_LABEL_CURTO: Record<string, string> = {
    garcom: 'Garçom',
    entregador: 'Entregador',
    cozinheiro: 'Cozinheiro',
    gerente: 'Gerente',
};

interface FechamentoDiarioModalProps {
    readonly onFechar: () => void;
}

/** Modal de fechamento financeiro diário: mostra, logo ao abrir o painel
 * gerencial, o faturamento do dia que é da pizzaria e o repasse exato que
 * cabe a cada garçom/entregador (gorjeta/taxa de serviço) — os dois nunca
 * devem ser confundidos. */
export function FechamentoDiarioModal({ onFechar }: Readonly<FechamentoDiarioModalProps>) {
    const [relatorio, setRelatorio] = useState<RelatorioVendas | null>(null);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const { inicio, fim } = intervaloPeriodoAtual('dia');
        buscarRelatorioVendas(inicio, fim)
            .then((dados) => setRelatorio(dados))
            .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar o fechamento do dia.'))
            .finally(() => setCarregando(false));
    }, []);

    return (
        <ModalOverlay
            titulo="Fechamento financeiro do dia"
            descricao="O que é faturamento da pizzaria e o que precisa ser repassado a cada garçom/entregador hoje."
            largura="560px"
            onFechar={onFechar}
        >
            {carregando && <Carregando>Carregando fechamento do dia...</Carregando>}
            {erro && <Erro role="alert">{erro}</Erro>}

            {relatorio && (
                <>
                    <Resumo>
                        <Indicador $destaque>
                            <IndicadorLabel>Faturamento da pizzaria (hoje)</IndicadorLabel>
                            <IndicadorValor>{formatarPreco(relatorio.faturamentoLoja)}</IndicadorValor>
                        </Indicador>
                        <Indicador>
                            <IndicadorLabel>Total a repassar (gorjeta/taxa de serviço)</IndicadorLabel>
                            <IndicadorValor>{formatarPreco(relatorio.totalGorjetas)}</IndicadorValor>
                        </Indicador>
                    </Resumo>

                    <TituloSecao>Repasse por garçom/entregador</TituloSecao>
                    {relatorio.repasses.length === 0 ? (
                        <Vazio>Nenhum repasse pendente hoje — sem gorjetas atribuídas a funcionários ainda.</Vazio>
                    ) : (
                        <ListaRepasses>
                            {relatorio.repasses.map((repasse) => (
                                <LinhaRepasse key={repasse.funcionarioId}>
                                    <div className="nome">
                                        <strong>{repasse.nome}</strong>
                                        <span>
                                            {repasse.profissao ? PROFISSAO_LABEL_CURTO[repasse.profissao] ?? repasse.profissao : 'Funcionário'}
                                            {' • '}
                                            {repasse.quantidadePedidos} pedido(s)
                                        </span>
                                    </div>
                                    <div className="valor">{formatarPreco(repasse.totalGorjetas)}</div>
                                </LinhaRepasse>
                            ))}
                        </ListaRepasses>
                    )}
                </>
            )}
        </ModalOverlay>
    );
}
