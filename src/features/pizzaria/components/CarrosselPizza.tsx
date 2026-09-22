/**
 * @file CarrosselPizza.tsx
 * @brief Carrossel horizontal de pizzas com setas de navegação (@see PizzaCard).
 *
 * @details
 * Controla o scroll do container via ref, habilitando/desabilitando os
 * botões de navegação conforme a posição atual de rolagem.
 */
import { useEffect, useRef, useState } from 'react';
import { PizzaCard } from './PizzaCard';
import type { Pizza } from '../types/pizza';

interface CarrosselPizzaProps {
  readonly pizzas: readonly Pizza[];
  readonly titulo: string;
  readonly compacto?: boolean;
  readonly mensagemVazia?: string;
}

/** @brief Carrossel horizontal de pizzas, com rolagem suave e botões de avançar/voltar. */
export function CarrosselPizza({
  pizzas,
  titulo,
  compacto = false,
  mensagemVazia = 'Nenhuma pizza encontrada.',
}: CarrosselPizzaProps) {
  const carrosselRef = useRef<HTMLDivElement>(null);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(false);

  /** @brief Atualiza os estados `inicio`/`fim` conforme a posição atual de rolagem do carrossel. */
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

  /** @brief Rola o carrossel para a direita em 80% da largura visível. */
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

  /** @brief Rola o carrossel para a esquerda em 80% da largura visível. */
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