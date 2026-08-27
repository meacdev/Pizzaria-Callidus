import { Link } from 'react-router';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import type { ItemCarrinho as ItemCarrinhoType } from '../types/itemCarrinho';

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

  const aumentarQuantidade = useCarrinhoStore(
    (state) => state.aumentarQuantidade,
  );

  const diminuirQuantidade = useCarrinhoStore(
    (state) => state.diminuirQuantidade,
  );

  const removerItem = useCarrinhoStore(
    (state) => state.removerItem,
  );

  const subtotal =
    item.precoUnitario * item.quantidade;

  /*
   * Informações que serão exibidas
   * independentemente do tipo.
   */
  let nome = '';
  let imagem = '/imagens/pizzas/pizzaSalgada.jpg';
  let link = '/cardapio';
  let categoria = '';

  if (item.tipo === 'pizza') {
    nome = item.pizza.nome;
    imagem = item.pizza.imgURL;
    link = `/pizza/${item.pizza.slug}`;
    categoria = 'Pizza';
  }

  if (item.tipo === 'bebida') {
    nome = item.bebida.nome;
    imagem = item.bebida.imgURL;
    categoria = 'Bebida';
  }

  if (item.tipo === 'combo') {
    nome = item.combo.nome;
    imagem = item.combo.imgURL;
    link = `/combo/${item.combo.slug}`;
    categoria = 'Combo';
  }

  return (
    <article className="card item-carrinho">

      <Link
        className="thumb"
        to={link}
        aria-label={`Ver ${nome}`}
      >
        <img
          src={imagem}
          alt={nome}
          loading="lazy"
        />
      </Link>

      <div className="detalhes">

        <header>

          <p className="categoria">
            {categoria}
          </p>

          <h3>
            {item.tipo === 'pizza' ? (
              <Link to={link}>
                {nome}
              </Link>
            ) : item.tipo === 'combo' ? (
              <Link to={link}>
                {nome}
              </Link>
            ) : (
              nome
            )}
          </h3>

        </header>

        {/* PERSONALIZAÇÕES DA PIZZA */}
        {item.tipo === 'pizza' && (
          <div className="personalizacao-carrinho">

            <p>
              <strong>Tamanho:</strong>{' '}
              {item.tamanho}
            </p>

            {item.borda && (
              <p>
                <strong>Borda:</strong>{' '}
                {item.borda}
              </p>
            )}

            {item.ingredientesRemovidos.length > 0 && (
              <p>
                <strong>Sem:</strong>{' '}
                {item.ingredientesRemovidos.join(', ')}
              </p>
            )}

            {item.extras.length > 0 && (
              <p>
                <strong>Extras:</strong>{' '}
                {item.extras.join(', ')}
              </p>
            )}

          </div>
        )}

        {/* ITENS DO COMBO */}
        {item.tipo === 'combo' && (
          <div className="personalizacao-carrinho">

            <p>
              <strong>Itens:</strong>{' '}
              {item.combo.itens.join(', ')}
            </p>

          </div>
        )}

        <div className="card-rodape">

          <strong className="preco">
            {formatarPreco(item.precoUnitario)} (un.)
          </strong>

          <div
            className="controle-quantidade"
            role="group"
            aria-label={`Quantidade de ${nome}`}
          >

            <button
              type="button"
              className="botao-quantidade"
              onClick={() =>
                diminuirQuantidade(item.id)
              }
              aria-label={`Diminuir quantidade de ${nome}`}
            >
              −
            </button>

            <span className="quantidade-valor">
              {item.quantidade}
            </span>

            <button
              type="button"
              className="botao-quantidade"
              onClick={() =>
                aumentarQuantidade(item.id)
              }
              aria-label={`Aumentar quantidade de ${nome}`}
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