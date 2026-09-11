/**
 * @file avaliacao.store.ts
 * @brief Store (zustand) da avaliação da loja feita pelo cliente (nota de 1 a 5).
 *
 * @details
 * Persiste no localStorage (`pizzaria-avaliacoes`) a lista de notas dadas e
 * se o usuário atual já avaliou, para não permitir avaliar duas vezes.
 * @see calcularMediaAvaliacao para obter a média exibida na tela.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 5;

/** @brief Estado e ações da avaliação da loja pelo cliente. */
interface AvaliacaoState {
  readonly avaliacoes: readonly number[];
  readonly jaAvaliou: boolean;
  readonly avaliar: (nota: number) => void;
}

/** @brief Store de avaliação da loja: guarda as notas dadas e impede reavaliação. */
export const useAvaliacaoStore = create<AvaliacaoState>()(
  persist(
    (set) => ({
      avaliacoes: [],
      jaAvaliou: false,
      avaliar: (nota) => {
        const notaNormalizada = Math.max(
          NOTA_MINIMA,
          Math.min(NOTA_MAXIMA, Math.round(nota)),
        );

        set((state) => {
          if (state.jaAvaliou) {
            return state;
          }

          return {
            avaliacoes: [...state.avaliacoes, notaNormalizada],
            jaAvaliou: true,
          };
        });
      },
    }),
    {
      name: 'pizzaria-avaliacoes',
    },
  ),
);

/**
 * @brief Calcula a média aritmética de uma lista de notas de avaliação.
 * @param avaliacoes Lista de notas já registradas.
 * @return A média das notas, ou 0 quando a lista está vazia.
 */
export function calcularMediaAvaliacao(avaliacoes: readonly number[]): number {
  if (avaliacoes.length === 0) {
    return 0;
  }

  const soma = avaliacoes.reduce((total, nota) => total + nota, 0);
  return soma / avaliacoes.length;
}
