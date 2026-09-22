/**
 * @file PedidoListaAdmin.tsx
 * @brief Tabela de pedidos do painel administrativo, com troca de status por pedido.
 */
import {
    STATUS_PEDIDO_LABEL,
    STATUS_PEDIDO_ORDEM,
    type Pedido,
    type StatusPedido,
} from '../../../store/pedido.store';
import styles from '../pages/PedidosAdminPage.module.css';

/** @brief Propriedades do componente {@link PedidoListaAdmin}. */
interface PedidoListaAdminProps {
    /** @brief Lista de pedidos a serem exibidos na tabela. */
    pedidos: readonly Pedido[];
    /** @brief Callback disparado ao alterar o status de um pedido pelo select. */
    onAtualizarStatus: (id: string, status: StatusPedido) => void;
}

/** @brief Formata um valor em reais (BRL). */
function formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
}

/** @brief Formata um timestamp ISO na data/hora curta em pt-BR. */
function formatarData(criadoEm: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(criadoEm),
    );
}

/** @brief Resume os itens de um pedido em uma única linha de texto ("2x Calabresa, 1x Coca"). */
function resumoItens(pedido: Pedido): string {
    return pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ');
}

/** @brief Classe CSS aplicada ao select de status conforme o status atual do pedido. */
const CLASSE_STATUS: Record<StatusPedido, string> = {
    recebido: styles.statusRecebido,
    em_preparo: styles.statusEmPreparo,
    pronto: styles.statusPronto,
    saiu_para_entrega: styles.statusSaiuParaEntrega,
    entregue: styles.statusEntregue,
    cancelado: styles.statusCancelado,
};

/** @brief Tabela com os pedidos recebidos, permitindo atualizar o status de cada um. */
export function PedidoListaAdmin({ pedidos, onAtualizarStatus }: Readonly<PedidoListaAdminProps>) {
    if (pedidos.length === 0) {
        return <p className={styles.vazio}>Nenhum pedido recebido ainda.</p>;
    }

    return (
        <table className={styles.tabela}>
            <thead>
                <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                    <th>Gorjeta</th>
                    <th>Recebido em</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {pedidos.map((pedido) => (
                    <tr key={pedido.id}>
                        <td className={styles.colunaId}>#{pedido.id.slice(0, 8).toUpperCase()}</td>
                        <td>
                            <div>{pedido.dados.cliente.nome}</div>
                            <div className={styles.colunaSecundaria}>{pedido.dados.cliente.telefone}</div>
                        </td>
                        <td className={styles.colunaItens}>{resumoItens(pedido)}</td>
                        <td>{formatarPreco(pedido.total)}</td>
                        <td className={styles.colunaSecundaria}>{pedido.dados.formaPagamento || '—'}</td>
                        <td className={styles.colunaSecundaria}>
                            {pedido.gorjeta ? `${pedido.gorjeta.percentual}% (${formatarPreco(pedido.gorjeta.valor)})` : '—'}
                        </td>
                        <td className={styles.colunaSecundaria}>{formatarData(pedido.criadoEm)}</td>
                        <td>
                            <select
                                className={`${styles.selectStatus} ${CLASSE_STATUS[pedido.status]}`}
                                value={pedido.status}
                                onChange={(e) => onAtualizarStatus(pedido.id, e.target.value as StatusPedido)}
                                aria-label={`Status do pedido #${pedido.id.slice(0, 8).toUpperCase()}`}
                            >
                                {STATUS_PEDIDO_ORDEM.map((status) => (
                                    <option key={status} value={status}>
                                        {STATUS_PEDIDO_LABEL[status]}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}