import { useCallback, useEffect, useMemo, useState } from 'react';
import { buscarPedidos, atualizarStatusPedido } from '../../pizzaria/api/pedido.service';
import type { Pedido, StatusPedido } from '../../../store/pedido.store';

export interface MetricasPedidos { faturamentoHoje: number; pedidosHoje: number; ticketMedioHoje: number; faturamentoMes: number; pedidosMes: number; variacaoMesPercentual: number; }
function mesmoDia(iso: string, ref: Date) { const d = new Date(iso); return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate(); }
function metricas(pedidos: readonly Pedido[]): MetricasPedidos {
  const hoje = new Date(); const mes = pedidos.filter((p) => { const d = new Date(p.criadoEm); return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth() && p.status !== 'cancelado'; });
  const hojePedidos = mes.filter((p) => mesmoDia(p.criadoEm, hoje)); const faturamentoHoje = hojePedidos.reduce((s, p) => s + p.total, 0);
  return { faturamentoHoje, pedidosHoje: hojePedidos.length, ticketMedioHoje: hojePedidos.length ? faturamentoHoje / hojePedidos.length : 0,
    faturamentoMes: mes.reduce((s, p) => s + p.total, 0), pedidosMes: mes.length, variacaoMesPercentual: 0 };
}
export function usePedidosAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); const [erro, setErro] = useState('');
  const carregar = useCallback(async () => { try { setPedidos(await buscarPedidos()); setErro(''); } catch (e) { setErro(e instanceof Error ? e.message : 'Falha ao carregar pedidos.'); } }, []);
  useEffect(() => { void carregar(); const timer = window.setInterval(() => void carregar(), 5000); return () => window.clearInterval(timer); }, [carregar]);
  const atualizarStatus = useCallback(async (id: string, status: StatusPedido) => { try { const atualizado = await atualizarStatusPedido(id, status); setPedidos((atual) => atual.map((p) => p.id === id ? atualizado : p)); } catch (e) { setErro(e instanceof Error ? e.message : 'Falha ao atualizar pedido.'); } }, []);
  const lista = useMemo(() => [...pedidos].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()), [pedidos]);
  return { pedidos: lista, erro, carregando: false, atualizarStatus, metricas: metricas(pedidos), recarregar: carregar };
}
