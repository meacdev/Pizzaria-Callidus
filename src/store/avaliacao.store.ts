import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 5;

interface AvaliacaoState {
  readonly avaliacoes: readonly number[];
  readonly avaliar: (nota: number) => void;
}

export const useAvaliacaoStore = create<AvaliacaoState>()(
  persist(
    (set) => ({
      avaliacoes: [],
      avaliar: (nota) => {
        const notaNormalizada = Math.max(
          NOTA_MINIMA,
          Math.min(NOTA_MAXIMA, Math.round(nota)),
        );

        set((state) => ({
          avaliacoes: [...state.avaliacoes, notaNormalizada],
        }));
      },
    }),
    {
      name: 'pizzaria-avaliacoes',
    },
  ),
);

export function calcularMediaAvaliacao(avaliacoes: readonly number[]): number {
  if (avaliacoes.length === 0) {
    return 0;
  }

  const soma = avaliacoes.reduce((total, nota) => total + nota, 0);
  return soma / avaliacoes.length;
}
