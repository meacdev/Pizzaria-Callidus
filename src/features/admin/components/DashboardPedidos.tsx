import type { MetricasPedidos } from '../hooks/usePedidosAdmin';
import styles from '../pages/PedidosAdminPage.module.css';

interface DashboardPedidosProps {
  metricas: MetricasPedidos;
}

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
}

export function DashboardPedidos({ metricas }: DashboardPedidosProps) {
  const {
    faturamentoHoje,
    pedidosHoje,
    ticketMedioHoje,
    faturamentoMes,
    pedidosMes,
    variacaoMesPercentual,
  } = metricas;

  return (
    <div className={styles.dashboard}>
      <div className={styles.cardMetrica}>
        <span className={styles.cardRotulo}>Faturamento hoje</span>
        <span className={styles.cardValor}>{formatarPreco(faturamentoHoje)}</span>
        <span className={styles.cardDetalhe}>{pedidosHoje} pedido(s)</span>
      </div>

      <div className={styles.cardMetrica}>
        <span className={styles.cardRotulo}>Ticket médio hoje</span>
        <span className={styles.cardValor}>{formatarPreco(ticketMedioHoje)}</span>
      </div>

      <div className={styles.cardMetrica}>
        <span className={styles.cardRotulo}>Faturamento do mês</span>
        <span className={styles.cardValor}>{formatarPreco(faturamentoMes)}</span>
        <span className={styles.cardDetalhe}>
          {pedidosMes} pedido(s) · estimativa (mock)
        </span>
      </div>

      <div className={styles.cardMetrica}>
        <span className={styles.cardRotulo}>Variação vs. mês anterior</span>
        <span className={styles.cardValor}>
          {variacaoMesPercentual >= 0 ? '+' : ''}
          {variacaoMesPercentual.toFixed(1)}%
        </span>
        <span className={styles.cardDetalhe}>estimativa (mock)</span>
      </div>
    </div>
  );
}