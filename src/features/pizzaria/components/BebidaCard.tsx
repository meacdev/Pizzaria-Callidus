import { Link } from 'react-router';
import type { Bebida } from '../types/bebida';

interface BebidaCardProps {
  readonly bebida: Bebida;
}

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);
}

export function BebidaCard({
  bebida,
}: BebidaCardProps) {
  return (
    <Link
      to={`/bebida/${bebida.id}`}
      className="card card-produto-link"
      aria-label={`Ver ${bebida.nome}`}
    > <div className="thumb"> <img
      src={bebida.imgURL}
      alt={bebida.nome}
      loading="lazy"
    /> </div>

      <div className="detalhes">

        <header>
          <p className="categoria">
            Bebida
          </p>

          <h3>
            {bebida.nome}
          </h3>
        </header>

        <p className="descricao-card">
          {bebida.descricao}
        </p>

        <div className="card-rodape">

          <strong className="preco">
            {formatarPreco(bebida.preco)}
          </strong>

          <span className="botao-carrinho">
            Ver detalhes
          </span>

        </div>

      </div>
    </Link>

  );
}
