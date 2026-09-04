import { useMemo } from 'react';
import { usePedidoStore, type Pedido, type StatusPedido } from '../../../store/pedido.store';

export interface MetricasPedidos {
  faturamentoHoje: number;
  pedidosHoje: number;
  ticketMedioHoje: number;
  faturamentoMes: number;
  pedidosMes: number;
  variacaoMesPercentual: number;
}

function ehMesmoDia(dataIso: string, referencia: Date): boolean {
  const data = new Date(dataIso);
  return (
    data.getFullYear() === referencia.getFullYear() &&
    data.getMonth() === referencia.getMonth() &&
    data.getDate() === referencia.getDate()
  );
}

function contaComoFaturamento(status: StatusPedido): boolean {
  return status !== 'cancelado';
}

// Mock: sem histórico persistido de dias anteriores, então o faturamento
// do mês é simulado a partir do que já foi vendido hoje.
function mockFaturamentoMes(faturamentoHoje: number, pedidosHoje: number) {
  const diaDoMes = new Date().getDate();
  const mediaDiariaEstimada = faturamentoHoje > 0 ? faturamentoHoje : 850;
  const faturamentoMes = mediaDiariaEstimada * diaDoMes * 0.92;
  const pedidosMes = Math.max(pedidosHoje, 1) * diaDoMes;
  const variacaoMesPercentual = 12.5; // mock fixo, ex: +12,5% vs mês anterior

  return { faturamentoMes, pedidosMes, variacaoMesPercentual };
}

function calcularMetricas(pedidos: readonly Pedido[]): MetricasPedidos {
  const hoje = new Date();

  const pedidosDeHoje = pedidos.filter(
    (p) => ehMesmoDia(p.criadoEm, hoje) && contaComoFaturamento(p.status),
  );

  const faturamentoHoje = pedidosDeHoje.reduce((soma, p) => soma + p.total, 0);
  const pedidosHoje = pedidosDeHoje.length;
  const ticketMedioHoje = pedidosHoje > 0 ? faturamentoHoje / pedidosHoje : 0;

  const { faturamentoMes, pedidosMes, variacaoMesPercentual } = mockFaturamentoMes(
    faturamentoHoje,
    pedidosHoje,
  );

  return {
    faturamentoHoje,
    pedidosHoje,
    ticketMedioHoje,
    faturamentoMes,
    pedidosMes,
    variacaoMesPercentual,
  };
}

export function usePedidosAdmin() {
  const pedidos = usePedidoStore((state) => state.pedidos);
  const atualizarStatusPedido = usePedidoStore((state) => state.atualizarStatusPedido);

  const pedidosRecebidos = useMemo(
    () =>
      [...pedidos].sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
      ),
    [pedidos],
  );

  const metricas = useMemo(() => calcularMetricas(pedidos), [pedidos]);

  const atualizarStatus = (id: string, status: StatusPedido) => {
    atualizarStatusPedido(id, status);
  };

  return { pedidos: pedidosRecebidos, atualizarStatus, metricas };
}