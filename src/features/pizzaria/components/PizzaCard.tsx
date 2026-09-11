/**
 * @file PizzaCard.tsx
 * @brief Card de pizza exibido nas listagens do cardápio (@see ListaPizzas / CarrosselPizza).
 */
import { Link } from 'react-router';
import type { Pizza } from '../types/pizza';
import { nomeCategoria } from '../utils/pizza.utils';

interface PizzaCardProps {
  readonly pizza: Pizza;
  readonly compacto?: boolean;
}

/** @brief Formata um preço (string vinda da API) em reais (BRL); mantém o valor bruto se não for numérico. */
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

/**
 * @brief Obtém a descrição da pizza a ser exibida no card, truncando-a em 130
 * caracteres quando o modo compacto está ativo.
 * @param pizza Pizza cuja descrição será exibida.
 * @param compacto Se `true`, trunca a descrição quando ela for longa.
 * @return Descrição completa ou truncada (com reticências).
 */
function obterDescricaoCard(
  pizza: Pizza,
  compacto: boolean,
): string {
  if (!compacto || pizza.descricao.length <= 130) {
    return pizza.descricao;
  }

  return `${pizza.descricao.slice(0, 130)}...`;
}

/** @brief Card clicável de uma pizza, levando à página de personalização do produto. */
export function PizzaCard({
  pizza,
  compacto = false,
}: PizzaCardProps) {
  return (<article className="card">

    <Link
      className="thumb"
      to={`/pizza/${pizza.slug}`}
      aria-label={`Ver ${pizza.nome}`}
    >
      <img
        src={pizza.imgURL}
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

      <p className="descricao-card">
        {obterDescricaoCard(pizza, compacto)}
      </p>

      <div className="card-rodape">
        <strong className="preco">
          {formatarPreco(pizza.precoBase)}
        </strong>

        <div className="card-acoes">
          <Link
            className="link-leia-mais"
            to={`/pizza/${pizza.slug}`}
          >
            Detalhes
          </Link>
        </div>
      </div>

    </div>

  </article>
  );
}
