import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ModalOverlay } from './ModalOverlay';
import { usePizzas } from '../../pizzaria/hooks/usePizzas';
import { useBebidas } from '../../pizzaria/hooks/useBebidas';
import { useCombos } from '../../pizzaria/hooks/useCombo';
import { useSeletorItens, type ItemSelecionavel, type ItemSelecionado } from '../../pizzaria/hooks/useSeletorItens';
import { OPCOES_GORJETA } from '../../pizzaria/types/checkout';
import type { GorjetaPedidoPayload } from '../../pizzaria/types/pedidoPayload';

type CategoriaCardapio = 'pizza' | 'bebida' | 'combo';

function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

const Abas = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const Aba = styled.button<{ $ativa: boolean }>`
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    border: 1.5px solid ${({ $ativa }) => ($ativa ? '#ff2a2a' : 'rgba(255,255,255,0.16)')};
    background: ${({ $ativa }) => ($ativa ? 'rgba(255,42,42,0.16)' : 'transparent')};
    color: ${({ $ativa }) => ($ativa ? '#ff8080' : '#d7c9c4')};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
`;

const ListaItens = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 220px;
    overflow-y: auto;
    margin-bottom: 1.1rem;
    padding-right: 0.25rem;
`;

const LinhaItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    border-radius: 10px;
    background: #150b08;
    border: 1px solid rgba(255, 255, 255, 0.08);

    div.info {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    div.info strong {
        font-size: 0.88rem;
    }

    div.info span {
        color: #b9a9a3;
        font-size: 0.76rem;
    }
`;

const Controle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;

    button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: #ff2a2a;
        color: #fff;
        font-weight: 900;
        cursor: pointer;
    }

    span {
        min-width: 1.2rem;
        text-align: center;
        font-weight: 800;
        font-size: 0.85rem;
    }
`;

const BotaoAdicionarPequeno = styled.button`
    border: none;
    border-radius: 999px;
    padding: 0.4rem 0.85rem;
    background: #ff2a2a;
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    flex-shrink: 0;

    &:hover { background: #ff5c5c; }
`;

const SecaoTitulo = styled.p`
    margin: 0 0 0.5rem;
    font-weight: 800;
    font-size: 0.9rem;
    color: #d7c9c4;
`;

const OpcoesGorjeta = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.1rem;
`;

const OpcaoGorjeta = styled.button<{ $selecionada: boolean }>`
    padding: 0.55rem 1rem;
    border-radius: 999px;
    border: 1.5px solid ${({ $selecionada }) => ($selecionada ? '#ff2a2a' : 'rgba(255,255,255,0.16)')};
    background: ${({ $selecionada }) => ($selecionada ? 'rgba(255,42,42,0.16)' : 'transparent')};
    color: #fff;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
`;

const Total = styled.p`
    margin: 0 0 1rem;
    font-size: 1.05rem;
    font-weight: 800;
    display: flex;
    justify-content: space-between;
`;

const Acoes = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
`;

const BotaoPrimario = styled.button`
    border: none;
    border-radius: 10px;
    padding: 0.75rem 1.3rem;
    font-weight: 800;
    background: #ff2a2a;
    color: #fff;
    cursor: pointer;

    &:hover:not(:disabled) { background: #ff5c5c; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BotaoSecundario = styled.button`
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 10px;
    padding: 0.75rem 1.3rem;
    font-weight: 700;
    background: transparent;
    color: #fff;
    cursor: pointer;
`;

interface NovoPedidoMesaDialogProps {
    readonly mesa: number;
    readonly onFechar: () => void;
    readonly onConfirmar: (itens: readonly ItemSelecionado[], gorjeta: GorjetaPedidoPayload | null) => void;
}

export function NovoPedidoMesaDialog({ mesa, onFechar, onConfirmar }: Readonly<NovoPedidoMesaDialogProps>) {
    const [categoria, setCategoria] = useState<CategoriaCardapio>('pizza');
    const [gorjetaPercentual, setGorjetaPercentual] = useState(0);
    const seletor = useSeletorItens();

    const { data: pizzas } = usePizzas();
    const { data: bebidas } = useBebidas();
    const { data: combos } = useCombos();

    const quantidadesPorChave = useMemo(() => {
        const mapa: Record<string, number> = {};
        seletor.itens.forEach((item) => { mapa[item.chave] = item.quantidade; });
        return mapa;
    }, [seletor.itens]);

    const itensDaCategoria: ItemSelecionavel[] = useMemo(() => {
        if (categoria === 'pizza') {
            return (pizzas ?? []).map((pizza) => ({
                chave: `pizza-${pizza.id}`,
                tipo: 'pizza' as const,
                id: pizza.id,
                nome: pizza.nome,
                precoUnitario: Number(pizza.precoBase),
            }));
        }

        if (categoria === 'bebida') {
            return (bebidas ?? []).map((bebida) => ({
                chave: `bebida-${bebida.id}`,
                tipo: 'bebida' as const,
                id: String(bebida.id),
                nome: bebida.nome,
                precoUnitario: bebida.preco,
            }));
        }

        return (combos ?? []).map((combo) => ({
            chave: `combo-${combo.id}`,
            tipo: 'combo' as const,
            id: combo.id,
            nome: combo.nome,
            precoUnitario: Number(combo.precoBase),
        }));
    }, [categoria, pizzas, bebidas, combos]);

    const valorGorjeta = Number(((seletor.total * gorjetaPercentual) / 100).toFixed(2));
    const totalComGorjeta = Number((seletor.total + valorGorjeta).toFixed(2));

    function confirmar() {
        if (seletor.itens.length === 0) return;
        onConfirmar(
            seletor.itens,
            gorjetaPercentual > 0 ? { percentual: gorjetaPercentual, valor: valorGorjeta } : null,
        );
    }

    return (
        <ModalOverlay
            titulo={`Novo pedido — Mesa ${mesa}`}
            descricao="Escolha os itens do pedido dessa mesa. Você envia para a cozinha depois, junto com o resto da comanda."
            largura="560px"
            onFechar={onFechar}
        >
            <Abas>
                <Aba type="button" $ativa={categoria === 'pizza'} onClick={() => setCategoria('pizza')}>Pizzas</Aba>
                <Aba type="button" $ativa={categoria === 'bebida'} onClick={() => setCategoria('bebida')}>Bebidas</Aba>
                <Aba type="button" $ativa={categoria === 'combo'} onClick={() => setCategoria('combo')}>Combos</Aba>
            </Abas>

            <ListaItens>
                {itensDaCategoria.length === 0 && <p style={{ color: '#b9a9a3' }}>Nada disponível nessa categoria.</p>}
                {itensDaCategoria.map((item) => {
                    const quantidade = quantidadesPorChave[item.chave] ?? 0;
                    return (
                        <LinhaItem key={item.chave}>
                            <div className="info">
                                <strong>{item.nome}</strong>
                                <span>{formatarPreco(item.precoUnitario)}</span>
                            </div>
                            {quantidade === 0 ? (
                                <BotaoAdicionarPequeno type="button" onClick={() => seletor.adicionar(item)}>Adicionar</BotaoAdicionarPequeno>
                            ) : (
                                <Controle>
                                    <button type="button" onClick={() => seletor.remover(item.chave)} aria-label={`Remover um ${item.nome}`}>−</button>
                                    <span>{quantidade}</span>
                                    <button type="button" onClick={() => seletor.adicionar(item)} aria-label={`Adicionar um ${item.nome}`}>+</button>
                                </Controle>
                            )}
                        </LinhaItem>
                    );
                })}
            </ListaItens>

            <SecaoTitulo>A mesa deixou gorjeta?</SecaoTitulo>
            <OpcoesGorjeta>
                {OPCOES_GORJETA.map((percentual) => (
                    <OpcaoGorjeta
                        key={percentual}
                        type="button"
                        $selecionada={gorjetaPercentual === percentual}
                        onClick={() => setGorjetaPercentual(percentual)}
                    >
                        {percentual === 0 ? 'Sem gorjeta' : `${percentual}%`}
                    </OpcaoGorjeta>
                ))}
            </OpcoesGorjeta>

            <Total>
                <span>Total do pedido</span>
                <span>{formatarPreco(totalComGorjeta)}</span>
            </Total>

            <Acoes>
                <BotaoSecundario type="button" onClick={onFechar}>Cancelar</BotaoSecundario>
                <BotaoPrimario type="button" disabled={seletor.itens.length === 0} onClick={confirmar}>
                    Adicionar à comanda
                </BotaoPrimario>
            </Acoes>
        </ModalOverlay>
    );
}
