/**
 * @file DashboardPedidos.tsx
 * @brief Painel de métricas de pedidos do admin: faturamento e ticket médio de hoje, e comparativo mensal.
 *
 * @details
 * As métricas em si vêm prontas de {@see usePedidosAdmin}; este componente
 * só formata e exibe os cards. Os indicadores mensais são estimativas
 * (mock).
 */
import type { MetricasPedidos } from '../hooks/usePedidosAdmin';
import styles from '../pages/PedidosAdminPage.module.css';

/** @brief Propriedades do componente {@link DashboardPedidos}. */
interface DashboardPedidosProps {
  /** @brief Métricas calculadas de pedidos (faturamento, ticket médio, variação mensal, etc.). */
  metricas: MetricasPedidos;
}

/** @brief Formata um valor em reais (BRL). */
function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
}

/** @brief Grade de cards com as principais métricas de pedidos do dia e do mês. */
export function DashboardPedidos({ metricas }: Readonly<DashboardPedidosProps>) {
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