/**
 * @file useCombo.tsx
 * @brief Hooks de consulta (react-query) para o catálogo de combos.
 */
import { useQuery } from '@tanstack/react-query';
import { buscarCombos } from '../api/combo.service';
import type { CategoriaCombo } from '../types/combo';

/** @brief Busca a lista completa de combos do cardápio. */
export function useCombos() {
  return useQuery({
    queryKey: ['combos'],
    queryFn: buscarCombos,
  });
}

/**
 * @brief Busca um combo específico pelo slug.
 * @param slug Slug do combo (undefined desativa a consulta).
 * @return Combo encontrado, ou undefined se não existir.
 */
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

/**
 * @brief Busca os combos de uma categoria específica.
 * @param categoria Categoria do combo (undefined desativa a consulta).
 * @return Lista de combos da categoria informada.
 */
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