import { Link } from 'react-router';
import { usePedidosAdmin } from '../hooks/usePedidosAdmin';
import { PedidoListaAdmin } from '../components/PedidoListaAdmin';
import { DashboardPedidos } from '../components/DashboardPedidos';
import styles from './PedidosAdminPage.module.css';

export function PedidosAdminPage() {
    const { pedidos, atualizarStatus, metricas } = usePedidosAdmin();

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

            <DashboardPedidos metricas={metricas} /> {/* novo */}

            <PedidoListaAdmin pedidos={pedidos} onAtualizarStatus={atualizarStatus} />
        </div>
    );
}