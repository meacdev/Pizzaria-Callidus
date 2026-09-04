import type { PedidoPayload } from '../types/pedidoPayload';
import type { Pedido, StatusPedido } from '../../../store/pedido.store';

export async function criarPedido(payload: PedidoPayload): Promise<Pedido> {
  const resposta = await fetch('/api/pedidos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!resposta.ok) throw new Error('Não foi possível enviar o pedido para a cozinha.');
  return resposta.json();
}

export async function listarPedidos(): Promise<Pedido[]> {
  const resposta = await fetch('/api/pedidos');
  if (!resposta.ok) throw new Error('Não foi possível carregar os pedidos.');
  return resposta.json();
}

export async function atualizarStatusPedido(id: string, status: StatusPedido): Promise<Pedido> {
  const resposta = await fetch(`/api/pedidos/${encodeURIComponent(id)}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
  });
  if (!resposta.ok) throw new Error('Não foi possível atualizar o pedido.');
  return resposta.json();
}
