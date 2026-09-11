/**
 * @file ComboCard.tsx
 * @brief Card de combo exibido nas listagens do cardápio (@see ListaCombos).
 */
import { Link } from 'react-router';
import type { Combo } from '../types/combo';
import { nomeCategoriaCombo } from '../utils/combo.utils';

interface ComboCardProps {
  readonly combo: Combo;
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
 * @brief Obtém a descrição do combo a ser exibida no card, truncando-a em 130
 * caracteres quando o modo compacto está ativo.
 * @param combo Combo cuja descrição será exibida.
 * @param compacto Se `true`, trunca a descrição quando ela for longa.
 * @return Descrição completa ou truncada (com reticências).
 */
function obterDescricaoCard(
  combo: Combo,
  compacto: boolean,
): string {
  if (!compacto || combo.descricao.length <= 130) {
    return combo.descricao;
  }

  return `${combo.descricao.slice(0, 130)}...`;
}

/** @brief Card clicável de um combo, levando à página de detalhes do produto. */
export function ComboCard({
  combo,
  compacto = false,
}: ComboCardProps) {
  return (
    <Link
      to={`/combo/${combo.slug}`}
      className="card card-produto-link"
      aria-label={`Ver ${combo.nome}`}
    > <div className="thumb">
        <img
          src={combo.imgURL}
          alt={`Combo ${combo.nome}`}
          loading="lazy"
        /> </div>

      <div className="detalhes">

        <header>

          <p className="categoria">
            {nomeCategoriaCombo(combo.categoria)}
          </p>

          <h3>
            {combo.nome}
          </h3>

        </header>

        <p className="descricao-card">
          {obterDescricaoCard(combo, compacto)}
        </p>

        <div className="card-rodape">

          <strong className="preco">
            {formatarPreco(combo.precoBase)}
          </strong>

          <span className="botao-carrinho">
            Ver detalhes
          </span>

        </div>

      </div>
    </Link>
  );
}
