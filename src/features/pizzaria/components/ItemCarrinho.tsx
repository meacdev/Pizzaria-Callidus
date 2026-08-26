import { Link } from 'react-router';

import { useCarrinhoStore } from '../../../store/carrinho.store';

import type { ItemCarrinho as ItemCarrinhoType } from '../types/itemCarrinho';

import { nomeCategoria } from '../utils/pizza.utils';

interface ItemCarrinhoProps {
  readonly item: ItemCarrinhoType;
}

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);
}

export function ItemCarrinho({
  item,
}: ItemCarrinhoProps) {
  const aumentarQuantidade =
    useCarrinhoStore(
      (state) => state.aumentarQuantidade,
    );
  const diminuirQuantidade =
    useCarrinhoStore(
      (state) => state.diminuirQuantidade,
    );
  const removerItem =
    useCarrinhoStore(
      (state) => state.removerItem,
    );
  const {
    pizza,
    quantidade,
    tamanho,
    ingredientesRemovidos,
    extras,
    borda,
    precoUnitario,
  } = item;
  const subtotal =
    precoUnitario * quantidade;

  return (
    <article className="card item-carrinho">
      <Link
        className="thumb"
        to={`/pizza/${pizza.slug}`}
        aria-label={`Ver ${pizza.nome}`}
      >
        <img
          src="/imagens/pizzas/pizzaSalgada.jpg"
          alt={`Capa da pizza ${pizza.nome}`}
          loading="lazy"
        />
      </Link>
      <div className="detalhes">
        <header>
          <p className="categoria">
            {nomeCategoria(pizza.categoria)}
          </p>
          <h3>
            <Link to={`/pizza/${pizza.slug}`}>
              {pizza.nome}
            </Link>
          </h3>
        </header>
        <div className="personalizacao-carrinho">
          <p>
            <strong>Tamanho:</strong>{' '}
            {tamanho}
          </p>
          {borda && (
            <p>
              <strong>Borda:</strong>{' '}
              {borda}
            </p>
          )}
          {ingredientesRemovidos.length > 0 && (
            <p>
              <strong>Sem:</strong>{' '}
              {ingredientesRemovidos.join(', ')}
            </p>
          )}
          {extras.length > 0 && (
            <p>
              <strong>Extras:</strong>{' '}
              {extras.join(', ')}
            </p>
          )}
        </div>
        <div className="card-rodape">
          <strong className="preco">
            {formatarPreco(precoUnitario)} (un.)
          </strong>
          <div
            className="controle-quantidade"
            role="group"
            aria-label={`Quantidade de ${pizza.nome}`}
          >
            <button
              type="button"
              className="botao-quantidade"
              onClick={() =>
                diminuirQuantidade(item.id)
              }
              aria-label={`Diminuir quantidade de ${pizza.nome}`}
            >
              −
            </button>
            <span className="quantidade-valor">
              {quantidade}
            </span>
            <button
              type="button"
              className="botao-quantidade"
              onClick={() =>
                aumentarQuantidade(item.id)
              }
              aria-label={`Aumentar quantidade de ${pizza.nome}`}
            >
              +
            </button>
          </div>
        </div>
        <div className="card-acoes item-carrinho-rodape">
          <strong className="subtotal">
            Subtotal:{' '}
            {formatarPreco(subtotal)}
          </strong>
          <button
            type="button"
            className="botao-perigo botao-remover"
            onClick={() =>
              removerItem(item.id)
            }
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}