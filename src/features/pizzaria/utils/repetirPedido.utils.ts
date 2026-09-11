/**
 * @file repetirPedido.utils.ts
 * @brief Reconstrói os itens de um pedido antigo para repetição, revalidando-os contra o cardápio atual.
 */
import type { Pedido } from '../../../store/pedido.store';
import type { ItemCarrinho } from '../types/itemCarrinho';
import type { Pizza } from '../types/pizza';
import type { Bebida } from '../types/bebida';
import type { Combo } from '../types/combo';
import { calcularPrecoPizza } from './precoPizza.utils';

export interface RevalidacaoItensPedido {
  /** Itens prontos para ir ao carrinho, já com dados/preço atualizados. */
  readonly itensParaAdicionar: readonly ItemCarrinho[];
  /** Nomes dos itens do pedido antigo que não existem mais no cardápio. */
  readonly itensIndisponiveis: readonly string[];
}

/**
 * Retorna o pedido mais recente feito pelo site (origem 'site') que tenha os
 * itens de carrinho originais salvos, ou null se o cliente ainda não tem
 * nenhum pedido nesse dispositivo/navegador.
 */
export function obterUltimoPedidoRepetivel(
  pedidos: readonly Pedido[],
): Pedido | null {
  // pedidos salvos antes da introdução do campo itensCarrinho não têm essa
  // propriedade no localStorage — tratamos como não repetíveis em vez de
  // quebrar a leitura.
  const ultimo = pedidos.find(
    (pedido) => pedido.origem === 'site' && (pedido.itensCarrinho?.length ?? 0) > 0,
  );

  return ultimo ?? null;
}

/**
 * Reconstrói os itens de um pedido antigo usando os dados atuais do
 * cardápio (pizzas, bebidas e combos podem ter mudado de preço ou até ter
 * saído do cardápio desde a última compra). Cada item ganha um novo id de
 * carrinho, já que ele está sendo adicionado como uma nova entrada.
 */
export function revalidarItensPedido(
  itensOriginais: readonly ItemCarrinho[],
  pizzasAtuais: readonly Pizza[],
  bebidasAtuais: readonly Bebida[],
  combosAtuais: readonly Combo[],
): RevalidacaoItensPedido {
  const itensParaAdicionar: ItemCarrinho[] = [];
  const itensIndisponiveis: string[] = [];

  for (const itemAntigo of itensOriginais) {
    if (itemAntigo.tipo === 'pizza') {
      const pizzaAtual = pizzasAtuais.find((pizza) => pizza.id === itemAntigo.pizza.id);

      if (!pizzaAtual) {
        itensIndisponiveis.push(itemAntigo.pizza.nome);
        continue;
      }

      itensParaAdicionar.push({
        ...itemAntigo,
        id: crypto.randomUUID(),
        pizza: pizzaAtual,
        precoUnitario: calcularPrecoPizza(
          pizzaAtual,
          itemAntigo.tamanho,
          itemAntigo.extras,
          itemAntigo.borda,
        ),
      });
      continue;
    }

    if (itemAntigo.tipo === 'bebida') {
      const bebidaAtual = bebidasAtuais.find((bebida) => bebida.id === itemAntigo.bebida.id);

      if (!bebidaAtual) {
        itensIndisponiveis.push(itemAntigo.bebida.nome);
        continue;
      }

      itensParaAdicionar.push({
        ...itemAntigo,
        id: crypto.randomUUID(),
        bebida: bebidaAtual,
        precoUnitario: bebidaAtual.preco,
      });
      continue;
    }

    // combo
    const comboAtual = combosAtuais.find((combo) => combo.id === itemAntigo.combo.id);

    if (!comboAtual) {
      itensIndisponiveis.push(itemAntigo.combo.nome);
      continue;
    }

    itensParaAdicionar.push({
      ...itemAntigo,
      id: crypto.randomUUID(),
      combo: comboAtual,
      precoUnitario: Number(comboAtual.precoBase),
    });
  }

  return { itensParaAdicionar, itensIndisponiveis };
}