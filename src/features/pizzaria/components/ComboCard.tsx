import { Link } from 'react-router';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import type { Combo } from '../types/combo';
import { nomeCategoriaCombo } from '../utils/combo.utils';

interface ComboCardProps {
  readonly combo: Combo;
  readonly compacto?: boolean;
}

function formatarPreco(preco: string): string {
  const valor = Number(preco);

  if (Number.isNaN(valor)) {
    return `R$ ${preco}`;
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function obterDescricaoCard(
  combo: Combo,
  compacto: boolean,
): string {
  if (!compacto || combo.descricao.length <= 130) {
    return combo.descricao;
  }

  return `${combo.descricao.slice(0, 130)}...`;
}

export function ComboCard({
  combo,
  compacto = false,
}: ComboCardProps) {

  const alternarCarrinho = useCarrinhoStore(
    (state) => state.alternarCarrinho,
  );

  const estaNosCarrinho = useCarrinhoStore(
    (state) => state.estaNosCarrinho(combo.id),
  );

  const textoBotaoCarrinho = estaNosCarrinho
    ? '★ No carrinho'
    : '☆ Adicionar ao carrinho';

  return (
    <article className="card">

      <Link
        className="thumb"
        to={`/combo/${combo.slug}`}
        aria-label={`Ver ${combo.nome}`}
      >
        <img
          src={`/imagens/pizzas/combo.jpg`}
          alt={`Capa do combo ${combo.nome}`}
          loading="lazy"
        />
      </Link>

      <div className="detalhes">

        <header>
          <p className="categoria">
            {nomeCategoriaCombo(combo.categoria)}
          </p>

          <h3>
            <Link to={`/combo/${combo.slug}`}>
              {combo.nome}
            </Link>
          </h3>
        </header>

        <p className="descricao-card">
          {obterDescricaoCard(combo, compacto)}
        </p>

        <div className="card-rodape">

          <strong className="preco">
            {formatarPreco(combo.precoBase)}
          </strong>

          <div className="card-acoes">

            <Link
              className="link-leia-mais"
              to={`/combo/${combo.slug}`}
            >
              Detalhes
            </Link>

            <button
              type="button"
              className="botao-carrinho"
              onClick={() => alternarCarrinho(combo.id)}
              aria-pressed={estaNosCarrinho}
            >
              {textoBotaoCarrinho}
            </button>

          </div>

        </div>

      </div>

    </article>
  );
}