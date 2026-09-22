/**
 * @file ListaBebidas.tsx
 * @brief Grade de bebidas do cardápio (@see BebidaCard), com mensagem para lista vazia.
 */
import type { Bebida } from '../types/bebida';
import { BebidaCard } from './BebidaCard';

interface ListaBebidasProps {
  readonly bebidas: readonly Bebida[];
  readonly titulo?: string;
}

/** @brief Seção com a grade de bebidas disponíveis no cardápio. */
export function ListaBebidas({
  bebidas,
  titulo = 'Bebidas',
}: ListaBebidasProps) {

  return (
    <section className="principal secao-pizzas">
      <div className="titulo-secao">
        <h2>
          {titulo}
        </h2>
        <span>
          {bebidas.length} bebida(s)
        </span>
      </div>
      {bebidas.length === 0 ? (
        <p className="mensagem-vazia">
          Nenhuma bebida encontrada.
        </p>
      ) : (
        <div
          className="grade-pizzas"
          aria-label={titulo}
        >
          {bebidas.map((bebida) => (
            <BebidaCard
              key={bebida.id}
              bebida={bebida}
            />
          ))}

        </div>

      )}

    </section>
  );
}