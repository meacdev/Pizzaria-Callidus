import { PizzaCard } from './PizzaCard';
import type { Pizza } from '../types/pizza';

interface ListaPizzasProps {
  readonly pizzas: readonly Pizza[];
  readonly titulo: string;
  readonly compacto?: boolean;
  readonly mensagemVazia?: string;
}

export function ListaPizzas({ pizzas, titulo, compacto = false, mensagemVazia = 'Nenhuma pizza encontrada.' }: ListaPizzasProps) {
  return (
    <section className="principal secao-pizzas">
      <div className="titulo-secao"><h2>{titulo}</h2><span>{pizzas.length} pizza(s)</span></div>
      {pizzas.length === 0 ? (
        <p className="mensagem-vazia">{mensagemVazia}</p>
      ) : (
        <div className="grade-pizzas" aria-label={titulo}>
          {pizzas.map((pizza) => <PizzaCard key={pizza.id} pizza={pizza} compacto={compacto} />)}
        </div>
      )}
    </section>
  );
}
