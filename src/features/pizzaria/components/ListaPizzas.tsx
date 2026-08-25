import { useEffect, useRef, useState } from 'react';
import { PizzaCard } from './PizzaCard';
import type { Pizza } from '../types/pizza';

interface ListaPizzasProps {
  readonly pizzas: readonly Pizza[];
  readonly titulo: string;
  readonly compacto?: boolean;
  readonly mensagemVazia?: string;
}

export function ListaPizzas({
  pizzas,
  titulo,
  compacto = false,
  mensagemVazia = 'Nenhuma pizza encontrada.',
}: ListaPizzasProps) {
  const carrosselRef = useRef<HTMLDivElement>(null);

  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(false);

  const verificarPosicao = () => {
    const carrossel = carrosselRef.current;

    if (!carrossel) {
      return;
    }

    const estaNoInicio = carrossel.scrollLeft <= 0;

    const estaNoFim =
      carrossel.scrollLeft + carrossel.clientWidth >=
      carrossel.scrollWidth - 1;

    setInicio(estaNoInicio);
    setFim(estaNoFim);
  };

  const avancar = () => {
    const carrossel = carrosselRef.current;

    if (!carrossel) {
      return;
    }

    carrossel.scrollBy({
      left: carrossel.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  const voltar = () => {
    const carrossel = carrosselRef.current;

    if (!carrossel) {
      return;
    }

    carrossel.scrollBy({
      left: -(carrossel.clientWidth * 0.8),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const carrossel = carrosselRef.current;

    if (!carrossel) {
      return;
    }

    verificarPosicao();

    carrossel.addEventListener('scroll', verificarPosicao);

    window.addEventListener('resize', verificarPosicao);

    return () => {
      carrossel.removeEventListener('scroll', verificarPosicao);
      window.removeEventListener('resize', verificarPosicao);
    };
  }, [pizzas]);

  return (
    <section className="principal-secao-pizzas">
      <div className="titulo-secao">
        <h2>{titulo}</h2>
        <span>{pizzas.length} pizza(s)</span>
      </div>

      {pizzas.length === 0 ? (
        <p className="mensagem-vazia">{mensagemVazia}</p>
      ) : (
        <div className="container-carrossel">
          <button
            type="button"
            className="botao-carrossel botao-carrossel-esquerda"
            onClick={voltar}
            disabled={inicio}
            aria-label="Ver pizzas anteriores"
          >
            ←
          </button>

          <div
            ref={carrosselRef}
            className="carrossel-pizzas"
            aria-label={titulo}
          >
            {pizzas.map((pizza) => (
              <div className="item-carrossel" key={pizza.id}>
                <PizzaCard
                  pizza={pizza}
                  compacto={compacto}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="botao-carrossel botao-carrossel-direita"
            onClick={avancar}
            disabled={fim}
            aria-label="Ver próximas pizzas"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}