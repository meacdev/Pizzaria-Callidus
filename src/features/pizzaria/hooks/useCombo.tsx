import { useQuery } from '@tanstack/react-query';
import { buscarCombos } from '../api/combo.service';
import type { CategoriaCombo } from '../types/combo';

export function useCombos() {
  return useQuery({
    queryKey: ['combos'],
    queryFn: buscarCombos,
  });
}

export function useComboPorSlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['combos', 'slug', slug],
    queryFn: async () => {
      const combos = await buscarCombos();

      return combos.find(
        (combo) => combo.slug === slug,
      );
    },
    enabled: Boolean(slug),
  });
}

export function useCombosPorCategoria(
  categoria: CategoriaCombo | undefined,
) {
  return useQuery({
    queryKey: ['combos', 'categoria', categoria],
    queryFn: async () => {
      const combos = await buscarCombos();

      return combos.filter(
        (combo) => combo.categoria === categoria,
      );
    },
    enabled: Boolean(categoria),
  });
}