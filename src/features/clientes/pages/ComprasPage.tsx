import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { listarComprasCliente } from '../api/cliente.service';
import type { PedidoApi } from '../../pizzaria/api/pedido.service';

const STATUS_LABEL: Record<string, string> = {
    recebido: 'Na fila',
    em_preparo: 'Em preparo',
    pronto: 'Concluído / aguardando envio',
    saiu_para_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
};

function formatarData(data: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

function formatarPreco(valor: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function idCurto(id: string) {
    return id.slice(0, 8).toUpperCase();
}

export function ComprasPage() {
    const { cliente } = useClienteAuth();
    const [compras, setCompras] = useState<PedidoApi[] | null>(null);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!cliente) return;

        listarComprasCliente(cliente.id)
            .then(setCompras)
            .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar suas compras.'));
    }, [cliente]);

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">Minha conta</span>
                <h1>Minhas compras</h1>
                <p>Histórico de pedidos feitos com a sua conta.</p>
            </main>

            <div className="principal usuario-layout">
                {erro && <span className="erro-campo" role="alert">{erro}</span>}

                {!compras ? (
                    <p>Carregando suas compras...</p>
                ) : compras.length === 0 ? (
                    <div className="estado" role="status">
                        <h2>Você ainda não tem nenhuma compra</h2>
                        <p>Faça seu primeiro pedido pelo cardápio para vê-lo aqui.</p>
                        <div className="acoes-pagina">
                            <Link className="botao-primario" to="/cardapio">Ver cardápio</Link>
                        </div>
                    </div>
                ) : (
                    <div className="compras-lista">
                        {compras.map((pedido) => (
                            <article key={pedido.pedidoId} className="compra-card">
                                <div className="compra-card-topo">
                                    <span className="compra-card-id">Pedido #{idCurto(pedido.pedidoId)}</span>
                                    <span className="compra-card-status">
                                        {STATUS_LABEL[pedido.status] ?? pedido.status}
                                    </span>
                                </div>
                                <p className="compra-card-itens">
                                    {pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}
                                </p>
                                <div className="compra-card-rodape">
                                    <span>Feito em {formatarData(pedido.criadoEm)}</span>
                                    <span className="compra-card-total">{formatarPreco(pedido.total)}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
