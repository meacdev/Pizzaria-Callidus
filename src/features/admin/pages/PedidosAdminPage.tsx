import { Link } from 'react-router';
import { useEntregaStore } from '../../../store/entrega.store';
import { usePedidosAdmin } from '../hooks/usePedidosAdmin';
import { PedidoListaAdmin } from '../components/PedidoListaAdmin';
import { DashboardPedidos } from '../components/DashboardPedidos';
import styles from './PedidosAdminPage.module.css';

export function PedidosAdminPage() {
    const { pedidos, atualizarStatus, metricas } = usePedidosAdmin();
    const notificacoes = useEntregaStore((state) => state.notificacoes);

    return (
        <div className={styles.container}>
            <Link className={styles.voltar} to="/admin/customizacao">
                ‹ Voltar
            </Link>

            <div className={styles.cabecalho}>
                <h1 style={{ margin: 0 }}>Gestão de Pedidos</h1>
            </div>

            <p className={styles.subtitulo}>
                Acompanhe os pedidos recebidos e atualize o status de cada um. A alteração é
                refletida na tela de acompanhamento do cliente.
            </p>

            {notificacoes.length > 0 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 12, background: '#eefbf2', border: '1px solid #ccebd7', color: '#176b37' }}>
                    <strong>🔔 Notificação de entrega</strong>
                    <div style={{ marginTop: '.35rem', fontSize: '.9rem' }}>{notificacoes[0].mensagem}</div>
                </div>
            )}

            <DashboardPedidos metricas={metricas} />

            <PedidoListaAdmin pedidos={pedidos} onAtualizarStatus={atualizarStatus} />
        </div>
    );
}