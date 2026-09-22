/**
 * @file usePedidosAdmin.ts
 * @brief Hook do painel administrativo com a lista de pedidos e métricas de faturamento (hoje/mês).
 *
 * @details
 * As métricas mensais são simuladas (@see mockFaturamentoMes), já que o
 * back-end ainda não mantém histórico persistido de dias anteriores.
 */
import { useMemo } from 'react';
import { usePedidoStore, type Pedido, type StatusPedido } from '../../../store/pedido.store';

/** @brief Métricas de faturamento e volume de pedidos calculadas para o dia atual e para o mês. */
export interface MetricasPedidos {
  faturamentoHoje: number;
  pedidosHoje: number;
  ticketMedioHoje: number;
  faturamentoMes: number;
  pedidosMes: number;
  variacaoMesPercentual: number;
}

/**
 * @brief Verifica se uma data ISO cai no mesmo dia (ano/mês/dia) que uma data de referência.
 * @param dataIso Data em formato ISO 8601.
 * @param referencia Data de referência para comparação.
 * @return `true` se ambas as datas forem do mesmo dia.
 */
function ehMesmoDia(dataIso: string, referencia: Date): boolean {
  const data = new Date(dataIso);
  return (
    data.getFullYear() === referencia.getFullYear() &&
    data.getMonth() === referencia.getMonth() &&
    data.getDate() === referencia.getDate()
  );
}

/** @brief Indica se um pedido com o status informado deve contar como faturamento (todo status exceto cancelado). */
function contaComoFaturamento(status: StatusPedido): boolean {
  return status !== 'cancelado';
}

/**
 * @brief Simula o faturamento e o volume de pedidos do mês a partir do faturamento de hoje.
 *
 * @details
 * Mock: sem histórico persistido de dias anteriores, então o faturamento
 * do mês é estimado extrapolando o dia atual pelo número de dias já
 * decorridos no mês.
 *
 * @param faturamentoHoje Faturamento já registrado hoje.
 * @param pedidosHoje Quantidade de pedidos já registrados hoje.
 * @return Faturamento do mês, pedidos do mês e variação percentual (mock fixo) estimados.
 */
function mockFaturamentoMes(faturamentoHoje: number, pedidosHoje: number) {
  const diaDoMes = new Date().getDate();
  const mediaDiariaEstimada = faturamentoHoje > 0 ? faturamentoHoje : 850;
  const faturamentoMes = mediaDiariaEstimada * diaDoMes * 0.92;
  const pedidosMes = Math.max(pedidosHoje, 1) * diaDoMes;
  const variacaoMesPercentual = 12.5; // mock fixo, ex: +12,5% vs mês anterior

  return { faturamentoMes, pedidosMes, variacaoMesPercentual };
}

/**
 * @brief Calcula as métricas de pedidos (hoje e mês) a partir da lista completa de pedidos.
 * @param pedidos Lista de pedidos da loja.
 * @return Métricas agregadas de faturamento e volume.
 */
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

/**
 * @brief Hook com a lista de pedidos (mais recentes primeiro), suas métricas e a ação de atualizar status.
 * @return `pedidos` ordenados, `atualizarStatus` e as `metricas` calculadas.
 */
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