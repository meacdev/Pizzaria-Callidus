/**
 * @file RastreamentoPedidos.tsx
 * @brief Painel de rastreamento de pedidos: quem fez, quem preparou e quem entregou/atendeu cada pedido.
 *
 * @details
 * Consulta @see buscarRastreamentoPedidos (rastreamento.service.ts), com
 * busca com debounce de 300ms. Pensado para o gerente localizar
 * rapidamente o responsável por um pedido em caso de reclamação.
 */
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { buscarRastreamentoPedidos } from '../api/rastreamento.service';
import type { LinhaRastreamento } from '../types/rastreamento';

const Caixa = styled.div`
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: #281410;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Busca = styled.input`
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    padding: 0.65rem 0.9rem;
    font-size: 0.92rem;
    color: #fff;
    background: #1a0d0a;
    color-scheme: dark;
    max-width: 420px;
`;

const TabelaContainer = styled.div`
    overflow-x: auto;
`;

const Tabela = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;

    th {
        text-align: left;
        padding: 0.6rem 0.7rem;
        color: #d7c9c4;
        font-weight: 700;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        white-space: nowrap;
    }

    td {
        padding: 0.6rem 0.7rem;
        color: #fff;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        white-space: nowrap;
    }

    tr:hover td {
        background: rgba(255, 255, 255, 0.03);
    }
`;

const Pendente = styled.span`
    color: #d7c9c4;
    font-style: italic;
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

/** @brief Rótulos em português para cada status de pedido, exibidos na tabela de rastreamento. */
const STATUS_LABEL: Record<string, string> = {
    recebido: 'Na fila',
    em_preparo: 'Em preparo',
    pronto: 'Pronto',
    saiu_para_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
};

/** @brief Reduz um id de pedido (UUID) às 8 primeiras posições, em maiúsculas, para exibição. */
function idCurto(id: string) {
    return id.slice(0, 8).toUpperCase();
}

/** @brief Formata um timestamp ISO como data/hora curta em pt-BR. */
function formatarData(data: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

/**
 * Rastreamento completo do fluxo de um pedido: quem fez (cliente), quem
 * preparou (cozinheiro) e quem ficou responsável por levá-lo até o
 * cliente (garçom na mesa ou entregador) — pensado para o gerente
 * resolver reclamações rapidamente ("qual entregador atendeu esse
 * cliente?").
 */
export function RastreamentoPedidos() {
    const [linhas, setLinhas] = useState<LinhaRastreamento[]>([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;
        setCarregando(true);

        const timeout = window.setTimeout(() => {
            buscarRastreamentoPedidos(busca)
                .then((dados) => {
                    if (ativo) setLinhas(dados);
                    if (ativo) setErro('');
                })
                .catch((e) => {
                    if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar o rastreamento.');
                })
                .finally(() => {
                    if (ativo) setCarregando(false);
                });
        }, 300);

        return () => {
            ativo = false;
            window.clearTimeout(timeout);
        };
    }, [busca]);

    return (
        <Caixa>
            <Busca
                type="search"
                placeholder="Buscar por cliente, nº do pedido, cozinheiro ou entregador/garçom..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar no rastreamento de pedidos"
            />

            {erro && <span style={{ color: '#ffb0b0' }}>{erro}</span>}

            {carregando ? (
                <Vazio>Carregando...</Vazio>
            ) : linhas.length === 0 ? (
                <Vazio>Nenhum pedido encontrado.</Vazio>
            ) : (
                <TabelaContainer>
                    <Tabela>
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Status</th>
                                <th>Cliente</th>
                                <th>Preparado por</th>
                                <th>Responsável (garçom/entregador)</th>
                                <th>Feito em</th>
                            </tr>
                        </thead>
                        <tbody>
                            {linhas.map((linha) => (
                                <tr key={linha.pedidoId}>
                                    <td>#{idCurto(linha.pedidoId)}</td>
                                    <td>{STATUS_LABEL[linha.status] ?? linha.status}</td>
                                    <td>{linha.clienteNome}</td>
                                    <td>
                                        {linha.cozinheiroNome ?? <Pendente>ainda não preparado</Pendente>}
                                    </td>
                                    <td>
                                        {linha.responsavelNome ? (
                                            `${linha.responsavelNome}${linha.mesa ? ` (mesa ${linha.mesa})` : ''}`
                                        ) : (
                                            <Pendente>sem responsável ainda</Pendente>
                                        )}
                                    </td>
                                    <td>{formatarData(linha.criadoEm)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Tabela>
                </TabelaContainer>
            )}
        </Caixa>
    );
}
