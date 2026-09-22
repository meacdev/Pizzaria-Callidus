/**
 * @file pedido.service.ts
 * @brief Serviço de acesso aos pedidos (criar, buscar, listar, atualizar status) e o tipo PedidoApi.
 *
 * @details
 * PedidoApi é usado por praticamente todas as páginas de painel (@see
 * BalcaoPage.tsx, @see CozinhaPage.tsx, @see ReservasPage.tsx e outras) e
 * também pela área do cliente (@see ComprasPage.tsx).
 */
import type { PedidoPayload } from '../types/pedidoPayload';
import type { StatusPedido } from '../../../store/pedido.store';

/** @brief Formato de um pedido como devolvido pela API. */
export interface PedidoApi extends Omit<PedidoPayload, 'status'> {
  readonly status: StatusPedido;
  readonly atualizadoEm: string;
  /** Comanda da mesa a que esse pedido está vinculado (null = sem comanda —
   * pedidos do site/balcão sem mesa não têm comanda). */
  readonly comandaId: string | null;
  /** Funcionário "responsável" pelo pedido para fins de repasse de gorjeta
   * no relatório gerencial — o garçom que lançou o pedido, ou o entregador
   * que saiu com ele para entrega. */
  readonly funcionarioId: number | null;
  /** Cliente cadastrado que fez o pedido (null em pedidos do totem/balcão,
   * ou quando o cliente não estava logado no checkout). */
  readonly clienteId: number | null;
  /** Cozinheiro que preparou o pedido — só para rastreamento do fluxo. */
  readonly preparadoPorId: number | null;
}

/** @brief Faz uma requisição JSON à API e lança erro com a mensagem do back-end quando a resposta não é ok. */
async function requisicao<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const dados = (await resposta.json().catch(() => ({}))) as T & { erro?: string };

  if (!resposta.ok) {
    throw new Error(dados.erro ?? `Erro HTTP ${resposta.status}`);
  }

  return dados;
}

/** @brief Vínculos opcionais atribuídos a um pedido ao criá-lo (comanda, garçom, cliente). */
export interface AtribuicaoPedido {
  /** Comanda da mesa a que esse pedido deve ser vinculado. */
  readonly comandaId?: string | null;
  /** Funcionário que lançou o pedido (garçom na mesa). */
  readonly funcionarioId?: number | null;
  /** Cliente logado que fez o pedido pelo site (programa de fidelidade e
   * histórico de compras). */
  readonly clienteId?: number | null;
}

/**
 * @brief Cria um novo pedido.
 * @param payload Dados do pedido (cliente, itens, pagamento etc.).
 * @param atribuicao Vínculos opcionais (comanda, garçom, cliente logado).
 * @return O pedido criado.
 */
export function criarPedido(payload: PedidoPayload, atribuicao?: AtribuicaoPedido): Promise<PedidoApi> {
  return requisicao<PedidoApi>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ ...payload, ...atribuicao }),
  });
}

/** @brief Busca um pedido pelo id. @param pedidoId Id do pedido. @return O pedido encontrado. */
export function obterPedido(pedidoId: string): Promise<PedidoApi> {
  return requisicao<PedidoApi>(`/api/pedidos/${encodeURIComponent(pedidoId)}`);
}

/** @brief Lista pedidos, opcionalmente filtrados por status. @param status Status a filtrar (opcional). @return Pedidos encontrados. */
export function listarPedidos(status?: string): Promise<PedidoApi[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return requisicao<PedidoApi[]>(`/api/pedidos${query}`);
}

/**
 * @brief Atualiza o status de um pedido, opcionalmente registrando quem lançou ou preparou.
 * @param pedidoId Id do pedido.
 * @param status Novo status.
 * @param funcionarioId Funcionário responsável pelo pedido (garçom/entregador), se aplicável.
 * @param preparadoPorId Cozinheiro que preparou o pedido, se aplicável.
 * @return O pedido atualizado.
 */
export function atualizarStatusPedidoApi(
  pedidoId: string,
  status: string,
  funcionarioId?: number | null,
  preparadoPorId?: number | null,
): Promise<PedidoApi> {
  return requisicao<PedidoApi>(`/api/pedidos/${encodeURIComponent(pedidoId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      ...(funcionarioId != null ? { funcionarioId } : {}),
      ...(preparadoPorId != null ? { preparadoPorId } : {}),
    }),
  });
}
