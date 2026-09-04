import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { EditarCadastroDialog } from '../components/EditarCadastroDialog';
import { NovoPedidoMesaDialog } from '../components/NovoPedidoMesaDialog';
import { listarPedidos, atualizarStatusPedidoApi, type PedidoApi } from '../../pizzaria/api/pedido.service';
import { enviarPedidoLocal, pagamentoLocalSimulado } from '../../pizzaria/utils/pedidoLocal.utils';
import { NUMEROS_DAS_MESAS } from '../../pizzaria/constants/mesas';
import type { ItemSelecionado } from '../../pizzaria/hooks/useSeletorItens';
import type { GorjetaPedidoPayload } from '../../pizzaria/types/pedidoPayload';

interface RascunhoComanda {
    readonly id: string;
    readonly itens: readonly ItemSelecionado[];
    readonly gorjeta: GorjetaPedidoPayload | null;
    readonly criadoEm: string;
}

type StatusMesa = 'vazia' | 'aberta' | 'pronta';

function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function idCurto(id: string): string {
    return id.slice(0, 8).toUpperCase();
}

function totalRascunho(rascunho: RascunhoComanda): number {
    const subtotal = rascunho.itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
    return Number((subtotal + (rascunho.gorjeta?.valor ?? 0)).toFixed(2));
}

/** Tempo que a comanda da mesa fica aberta depois do mouse sair, pra dar
 * tempo de mover até os botões (enviar pra cozinha, entregar etc.) sem ela
 * fechar antes de clicar. */
const DELAY_FECHAR_COMANDA_MS = 3000;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
`;

const Painel = styled.section`
    padding: 1.75rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    background: linear-gradient(145deg, #281410, rgba(58, 28, 21, 0.82));
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
`;

const CabecalhoPainel = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.1rem;

    h2 {
        margin: 0;
        font-size: 1.35rem;
        color: #fff;
    }

    p {
        margin: 0.35rem 0 0;
        color: #d7c9c4;
        font-size: 0.88rem;
        max-width: 620px;
    }
`;

const LinhaContaBotoes = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
`;

const BotaoConta = styled.button`
    min-height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    padding: 0.65rem 1.1rem;
    font-weight: 800;
    background: #3a1c15;
    color: #fff;
    cursor: pointer;

    &:hover { background: #47231a; border-color: rgba(255, 255, 255, 0.24); }
`;

const BotaoSair = styled(BotaoConta)`
    background: transparent;
    border-color: rgba(255, 90, 90, 0.35);
    color: #ff8080;

    &:hover { background: rgba(230, 0, 0, 0.12); border-color: #ff5c5c; }
`;

const GradeMesas = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.1rem;
`;

const AssentoTopo = styled.div`
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 4px;
`;

const AssentoBaixo = styled(AssentoTopo)`
    margin-bottom: 0;
    margin-top: 4px;
`;

const Assento = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.22);
`;

const MesaCard = styled.div<{ $status: StatusMesa }>`
    position: relative;
    padding: 0.9rem 0.6rem 0.7rem;
    border-radius: 16px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    background: ${({ $status }) => (
        $status === 'pronta' ? 'rgba(42, 200, 110, 0.14)'
            : $status === 'aberta' ? 'rgba(255, 199, 44, 0.1)'
                : 'rgba(0, 0, 0, 0.18)'
    )};
    border: 1.5px solid ${({ $status }) => (
        $status === 'pronta' ? 'rgba(42, 200, 110, 0.55)'
            : $status === 'aberta' ? 'rgba(255, 199, 44, 0.4)'
                : 'rgba(255, 255, 255, 0.12)'
    )};
    transition: transform 0.15s ease, border-color 0.15s ease;

    &:hover {
        transform: translateY(-2px);
        border-color: #ff5c5c;
    }
`;

const MesaMesa = styled.div`
    width: 100%;
    height: 42px;
    border-radius: 10px;
    background: #4a2b20;
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.95rem;
`;

const RotuloMesa = styled.p`
    margin: 0.55rem 0 0;
    font-size: 0.78rem;
    color: #d7c9c4;
    font-weight: 700;
`;

const SeloStatus = styled.span<{ $status: StatusMesa }>`
    position: absolute;
    top: 6px;
    right: 6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 900;
    display: ${({ $status }) => ($status === 'vazia' ? 'none' : 'flex')};
    align-items: center;
    justify-content: center;
    background: ${({ $status }) => ($status === 'pronta' ? '#2ac86e' : '#ffc72c')};
    color: #150b08;
`;

const ComandaPopover = styled.div<{ $aberto: boolean }>`
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    width: 280px;
    max-height: 340px;
    overflow-y: auto;
    background: #1e100c;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    padding: 0.9rem;
    text-align: left;
    cursor: default;
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 30;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);

    ${({ $aberto }) => ($aberto ? `
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, 0);
        pointer-events: auto;
    ` : `
        opacity: 0;
        visibility: hidden;
        transform: translate(-50%, 6px);
        pointer-events: none;
    `)}
`;

const Comanda = styled.div`
    background: #fdf6e9;
    color: #2b1c12;
    border-radius: 10px;
    padding: 0.75rem 0.8rem;
    margin-bottom: 0.6rem;
    font-family: 'Courier New', monospace;
    font-size: 0.76rem;

    &:last-child { margin-bottom: 0; }
`;

const ComandaTopo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed #b8a88f;
    padding-bottom: 0.4rem;
    margin-bottom: 0.4rem;
    font-weight: 800;
`;

const ComandaItens = styled.ul`
    margin: 0 0 0.4rem;
    padding-left: 1rem;
`;

const ComandaTotal = styled.p`
    margin: 0.4rem 0 0;
    border-top: 1px dashed #b8a88f;
    padding-top: 0.4rem;
    font-weight: 800;
    display: flex;
    justify-content: space-between;
`;

const BotaoComanda = styled.button`
    width: 100%;
    margin-top: 0.5rem;
    border: none;
    border-radius: 8px;
    padding: 0.45rem;
    font-weight: 800;
    font-size: 0.72rem;
    cursor: pointer;
    background: #ff2a2a;
    color: #fff;

    &:hover { background: #ff5c5c; }
`;

const BotaoComandaSecundario = styled(BotaoComanda)`
    background: transparent;
    border: 1px solid #b8a88f;
    color: #2b1c12;

    &:hover { background: rgba(0,0,0,0.06); }
`;

const VazioPopover = styled.p`
    margin: 0;
    color: #d7c9c4;
    font-size: 0.8rem;
    text-align: center;
`;

const Lista = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
`;

const CardPedido = styled.article`
    padding: 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: #281410;
`;

const TopoCard = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    strong { font-size: 0.95rem; }
`;

const Badge = styled.span<{ $tom: 'site' | 'totem' }>`
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 800;
    background: ${({ $tom }) => ($tom === 'site' ? 'rgba(66, 153, 225, 0.16)' : 'rgba(255, 199, 44, 0.16)')};
    color: ${({ $tom }) => ($tom === 'site' ? '#8fc9ff' : '#ffd86a')};
    border: 1px solid ${({ $tom }) => ($tom === 'site' ? 'rgba(66, 153, 225, 0.3)' : 'rgba(255, 199, 44, 0.3)')};
`;

const InfoCard = styled.p`
    margin: 0.85rem 0 0;
    color: #d7c9c4;
    font-size: 0.88rem;
    line-height: 1.5;

    strong { color: #fff; }
`;

const ItensCard = styled.ul`
    margin: 0.8rem 0;
    padding: 0.7rem 0 0.7rem 1.1rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.12);
    border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    color: #d7c9c4;
    font-size: 0.85rem;
    line-height: 1.6;
`;

const TotalCard = styled.p`
    margin: 0;
    font-weight: 800;
`;

const BotaoAcaoCard = styled.button`
    width: 100%;
    margin-top: 0.9rem;
    min-height: 40px;
    border: none;
    border-radius: 10px;
    font-weight: 800;
    background: #ff2a2a;
    color: #fff;
    cursor: pointer;

    &:hover { background: #ff5c5c; }
`;

const Vazio = styled.div`
    min-height: 80px;
    padding: 1.25rem;
    display: grid;
    place-items: center;
    color: #d7c9c4;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    text-align: center;
    background: rgba(0, 0, 0, 0.08);
`;

const Erro = styled.p`
    margin: 0 0 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(230, 0, 0, 0.3);
    border-radius: 12px;
    background: rgba(230, 0, 0, 0.09);
    color: #ffb0b0;
`;

export function BalcaoPage() {
    const { funcionario, sair } = useFuncionarioAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState<PedidoApi[]>([]);
    const [erro, setErro] = useState('');
    const [editandoCadastro, setEditandoCadastro] = useState(false);
    const [mesaParaNovoPedido, setMesaParaNovoPedido] = useState<number | null>(null);
    const [rascunhos, setRascunhos] = useState<Record<number, RascunhoComanda[]>>({});
    const [enviando, setEnviando] = useState<string | null>(null);
    const [mesaComComandaAberta, setMesaComComandaAberta] = useState<number | null>(null);
    const fechamentoComandaRef = useRef<number | null>(null);

    function limparFechamentoAgendado() {
        if (fechamentoComandaRef.current !== null) {
            window.clearTimeout(fechamentoComandaRef.current);
            fechamentoComandaRef.current = null;
        }
    }

    function abrirComandaDaMesa(mesa: number) {
        limparFechamentoAgendado();
        setMesaComComandaAberta(mesa);
    }

    function agendarFechamentoDaComanda() {
        limparFechamentoAgendado();
        fechamentoComandaRef.current = window.setTimeout(() => {
            setMesaComComandaAberta(null);
            fechamentoComandaRef.current = null;
        }, DELAY_FECHAR_COMANDA_MS);
    }

    useEffect(() => () => limparFechamentoAgendado(), []);

    async function carregarPedidos() {
        try {
            setPedidos(await listarPedidos());
            setErro('');
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível carregar os pedidos.');
        }
    }

    useEffect(() => {
        void carregarPedidos();
        const intervalo = window.setInterval(() => void carregarPedidos(), 5000);
        return () => window.clearInterval(intervalo);
    }, []);

    const pedidosLocaisAtivos = useMemo(
        () => pedidos.filter((p) => p.origem === 'local' && p.mesa !== null && ['recebido', 'em_preparo', 'pronto'].includes(p.status)),
        [pedidos],
    );

    const pedidosParaConferir = useMemo(
        () => pedidos.filter((p) => p.status === 'recebido' && (p.canal === 'site' || p.canal === 'totem')),
        [pedidos],
    );

    const prontosParaBalcao = useMemo(
        () => pedidos.filter((p) => p.canal === 'totem' && p.mesa === null && p.status === 'pronto'),
        [pedidos],
    );

    function statusDaMesa(mesa: number): StatusMesa {
        const pedidosDaMesa = pedidosLocaisAtivos.filter((p) => p.mesa === mesa);
        if (pedidosDaMesa.some((p) => p.status === 'pronto')) return 'pronta';
        if ((rascunhos[mesa]?.length ?? 0) > 0 || pedidosDaMesa.length > 0) return 'aberta';
        return 'vazia';
    }

    function contadorDaMesa(mesa: number): number {
        return (rascunhos[mesa]?.length ?? 0) + pedidosLocaisAtivos.filter((p) => p.mesa === mesa).length;
    }

    function adicionarRascunho(mesa: number, itens: readonly ItemSelecionado[], gorjeta: GorjetaPedidoPayload | null) {
        const novoRascunho: RascunhoComanda = { id: crypto.randomUUID(), itens, gorjeta, criadoEm: new Date().toISOString() };
        setRascunhos((atuais) => ({ ...atuais, [mesa]: [...(atuais[mesa] ?? []), novoRascunho] }));
        setMesaParaNovoPedido(null);
    }

    function descartarRascunho(mesa: number, rascunhoId: string) {
        setRascunhos((atuais) => ({ ...atuais, [mesa]: (atuais[mesa] ?? []).filter((r) => r.id !== rascunhoId) }));
    }

    async function enviarRascunhoParaCozinha(mesa: number, rascunho: RascunhoComanda) {
        setEnviando(rascunho.id);
        try {
            await enviarPedidoLocal({
                canal: 'garcom',
                mesa,
                cliente: { nome: `Mesa ${mesa}` },
                itens: rascunho.itens,
                gorjeta: rascunho.gorjeta,
                pagamento: pagamentoLocalSimulado('dinheiro', `Comanda lançada pelo garçom — mesa ${mesa}`),
            });
            descartarRascunho(mesa, rascunho.id);
            await carregarPedidos();
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível enviar o pedido para a cozinha.');
        } finally {
            setEnviando(null);
        }
    }

    async function enviarParaCozinha(pedido: PedidoApi) {
        setEnviando(pedido.pedidoId);
        try {
            await atualizarStatusPedidoApi(pedido.pedidoId, 'em_preparo');
            await carregarPedidos();
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível enviar o pedido para a cozinha.');
        } finally {
            setEnviando(null);
        }
    }

    async function concluirEntrega(pedido: PedidoApi) {
        setEnviando(pedido.pedidoId);
        try {
            await atualizarStatusPedidoApi(pedido.pedidoId, 'entregue');
            await carregarPedidos();
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível concluir a entrega.');
        } finally {
            setEnviando(null);
        }
    }

    function sairDaConta() {
        sair();
        navigate('/admin');
    }

    function rotuloOrigem(pedido: PedidoApi): { texto: string; tom: 'site' | 'totem' } {
        if (pedido.canal === 'site') return { texto: 'Site — entrega', tom: 'site' };
        if (pedido.mesa) return { texto: `Totem — mesa ${pedido.mesa}`, tom: 'totem' };
        return { texto: 'Totem — balcão', tom: 'totem' };
    }

    return (
        <PainelLayout icone="🧾" titulo="Painel do Balcão" tema="escuro">
            <Container>
                {erro && <Erro role="alert"><strong>Erro:</strong> {erro}</Erro>}

                <Painel>
                    <LinhaContaBotoes>
                        <div>
                            <h2 style={{ margin: 0, color: '#fff' }}>Olá, {funcionario?.nome}!</h2>
                            <p style={{ margin: '0.35rem 0 0', color: '#d7c9c4' }}>Gerencie as mesas do salão e os pedidos que chegam pelo site e pelo totem.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <BotaoConta type="button" onClick={() => setEditandoCadastro(true)}>Editar meu cadastro</BotaoConta>
                            <BotaoSair type="button" onClick={sairDaConta}>Sair</BotaoSair>
                        </div>
                    </LinhaContaBotoes>
                </Painel>

                <Painel>
                    <CabecalhoPainel>
                        <div>
                            <h2>Salão — mesas</h2>
                            <p>Clique numa mesa para lançar um pedido novo. Passe o mouse para ver a comanda e enviar para a cozinha.</p>
                        </div>
                    </CabecalhoPainel>

                    <GradeMesas>
                        {NUMEROS_DAS_MESAS.map((mesa) => {
                            const status = statusDaMesa(mesa);
                            const contador = contadorDaMesa(mesa);
                            const rascunhosDaMesa = rascunhos[mesa] ?? [];
                            const pedidosDaMesa = pedidosLocaisAtivos.filter((p) => p.mesa === mesa);
                            const temAlgo = rascunhosDaMesa.length > 0 || pedidosDaMesa.length > 0;

                            return (
                                <MesaCard
                                    key={mesa}
                                    data-mesa={mesa}
                                    $status={status}
                                    onClick={() => setMesaParaNovoPedido(mesa)}
                                    onMouseEnter={() => abrirComandaDaMesa(mesa)}
                                    onMouseLeave={agendarFechamentoDaComanda}
                                >
                                    <SeloStatus $status={status}>{contador}</SeloStatus>
                                    <AssentoTopo><Assento /><Assento /></AssentoTopo>
                                    <MesaMesa>Mesa {mesa}</MesaMesa>
                                    <AssentoBaixo><Assento /><Assento /></AssentoBaixo>
                                    <RotuloMesa>4 lugares</RotuloMesa>

                                    <ComandaPopover
                                        $aberto={mesaComComandaAberta === mesa}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseEnter={() => abrirComandaDaMesa(mesa)}
                                        onMouseLeave={agendarFechamentoDaComanda}
                                    >
                                        {!temAlgo && <VazioPopover>Nenhum pedido nessa mesa ainda.</VazioPopover>}

                                        {rascunhosDaMesa.map((rascunho) => (
                                            <Comanda key={rascunho.id}>
                                                <ComandaTopo><span>COMANDA</span><span>Aguardando envio</span></ComandaTopo>
                                                <ComandaItens>
                                                    {rascunho.itens.map((item) => (
                                                        <li key={item.chave}>{item.quantidade}x {item.nome}</li>
                                                    ))}
                                                </ComandaItens>
                                                {rascunho.gorjeta && <p style={{ margin: '0 0 0.3rem' }}>Gorjeta: {rascunho.gorjeta.percentual}%</p>}
                                                <ComandaTotal><span>Total</span><span>{formatarPreco(totalRascunho(rascunho))}</span></ComandaTotal>
                                                <BotaoComanda
                                                    type="button"
                                                    disabled={enviando === rascunho.id}
                                                    onClick={(e) => { e.stopPropagation(); void enviarRascunhoParaCozinha(mesa, rascunho); }}
                                                >
                                                    {enviando === rascunho.id ? 'Enviando...' : 'Enviar para a cozinha'}
                                                </BotaoComanda>
                                                <BotaoComandaSecundario type="button" onClick={(e) => { e.stopPropagation(); descartarRascunho(mesa, rascunho.id); }}>
                                                    Remover
                                                </BotaoComandaSecundario>
                                            </Comanda>
                                        ))}

                                        {pedidosDaMesa.map((pedido) => (
                                            <Comanda key={pedido.pedidoId}>
                                                <ComandaTopo>
                                                    <span>#{idCurto(pedido.pedidoId)}</span>
                                                    <span>{pedido.status === 'pronto' ? 'Pronto!' : pedido.status === 'em_preparo' ? 'Em preparo' : 'Na fila'}</span>
                                                </ComandaTopo>
                                                <ComandaItens>
                                                    {pedido.itens.map((item) => (
                                                        <li key={item.id}>{item.quantidade}x {item.nome}</li>
                                                    ))}
                                                </ComandaItens>
                                                <ComandaTotal><span>Total</span><span>{formatarPreco(pedido.total)}</span></ComandaTotal>
                                                {pedido.status === 'pronto' && (
                                                    <BotaoComanda
                                                        type="button"
                                                        disabled={enviando === pedido.pedidoId}
                                                        onClick={(e) => { e.stopPropagation(); void concluirEntrega(pedido); }}
                                                    >
                                                        {enviando === pedido.pedidoId ? 'Entregando...' : 'Entregar para a mesa'}
                                                    </BotaoComanda>
                                                )}
                                            </Comanda>
                                        ))}
                                    </ComandaPopover>
                                </MesaCard>
                            );
                        })}
                    </GradeMesas>
                </Painel>

                <Painel>
                    <CabecalhoPainel>
                        <div>
                            <h2>Pedidos do site e do totem</h2>
                            <p>Confira o pedido e mande para a cozinha. Pedidos locais (totem) com mesa voltam para o salão quando ficarem prontos.</p>
                        </div>
                    </CabecalhoPainel>

                    {pedidosParaConferir.length === 0 ? (
                        <Vazio>Nenhum pedido novo do site ou do totem no momento.</Vazio>
                    ) : (
                        <Lista>
                            {pedidosParaConferir.map((pedido) => {
                                const origem = rotuloOrigem(pedido);
                                return (
                                    <CardPedido key={pedido.pedidoId}>
                                        <TopoCard>
                                            <strong>#{idCurto(pedido.pedidoId)}</strong>
                                            <Badge $tom={origem.tom}>{origem.texto}</Badge>
                                        </TopoCard>
                                        <InfoCard><strong>{pedido.cliente.nome}</strong></InfoCard>
                                        <ItensCard>
                                            {pedido.itens.map((item) => <li key={item.id}>{item.quantidade}x {item.nome}</li>)}
                                        </ItensCard>
                                        <TotalCard>Total: {formatarPreco(pedido.total)}</TotalCard>
                                        <BotaoAcaoCard
                                            type="button"
                                            disabled={enviando === pedido.pedidoId}
                                            onClick={() => void enviarParaCozinha(pedido)}
                                        >
                                            {enviando === pedido.pedidoId ? 'Enviando...' : 'Enviar pedido para a cozinha'}
                                        </BotaoAcaoCard>
                                    </CardPedido>
                                );
                            })}
                        </Lista>
                    )}
                </Painel>

                {prontosParaBalcao.length > 0 && (
                    <Painel>
                        <CabecalhoPainel>
                            <div>
                                <h2>Prontos para retirada no balcão</h2>
                                <p>Pedidos do totem sem mesa (o cliente vai retirar direto no balcão).</p>
                            </div>
                        </CabecalhoPainel>
                        <Lista>
                            {prontosParaBalcao.map((pedido) => (
                                <CardPedido key={pedido.pedidoId}>
                                    <TopoCard>
                                        <strong>#{idCurto(pedido.pedidoId)}</strong>
                                        <Badge $tom="totem">Totem — balcão</Badge>
                                    </TopoCard>
                                    <InfoCard><strong>{pedido.cliente.nome}</strong></InfoCard>
                                    <ItensCard>
                                        {pedido.itens.map((item) => <li key={item.id}>{item.quantidade}x {item.nome}</li>)}
                                    </ItensCard>
                                    <TotalCard>Total: {formatarPreco(pedido.total)}</TotalCard>
                                    <BotaoAcaoCard
                                        type="button"
                                        disabled={enviando === pedido.pedidoId}
                                        onClick={() => void concluirEntrega(pedido)}
                                    >
                                        {enviando === pedido.pedidoId ? 'Concluindo...' : 'Concluir retirada'}
                                    </BotaoAcaoCard>
                                </CardPedido>
                            ))}
                        </Lista>
                    </Painel>
                )}
            </Container>

            {editandoCadastro && <EditarCadastroDialog onFechar={() => setEditandoCadastro(false)} />}

            {mesaParaNovoPedido !== null && (() => {
                const mesaDoDialogo = mesaParaNovoPedido;
                return (
                    <NovoPedidoMesaDialog
                        mesa={mesaDoDialogo}
                        onFechar={() => setMesaParaNovoPedido(null)}
                        onConfirmar={(itens, gorjeta) => adicionarRascunho(mesaDoDialogo, itens, gorjeta)}
                    />
                );
            })()}
        </PainelLayout>
    );
}
