/**
 * @file usePizzas.tsx
 * @brief Hooks de consulta (react-query) para o catálogo de pizzas.
 */
import { useQuery } from '@tanstack/react-query';
import { buscarPizzas } from '../api/pizza.service';
import type { Categoria } from '../types/pizza';

/** @brief Busca a lista completa de pizzas do cardápio. */
export function usePizzas() {
  return useQuery({
    queryKey: ['pizzas'],
    queryFn: buscarPizzas,
  });
}

/**
 * @brief Busca uma pizza específica pelo slug.
 * @param slug Slug da pizza (undefined desativa a consulta).
 * @return Pizza encontrada, ou undefined se não existir.
 */
export function usePizzaPorSlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['pizzas', 'slug', slug],
    queryFn: async () => {
      const pizzas = await buscarPizzas();
      return pizzas.find((pizza) => pizza.slug === slug);
    },
    enabled: Boolean(slug),
  });
}

/**
 * @brief Busca as pizzas de uma categoria específica.
 * @param categoria Categoria da pizza (undefined desativa a consulta).
 * @return Lista de pizzas da categoria informada.
 */
export function usePizzasPorCategoria(categoria: Categoria | undefined) {
  return useQuery({
    queryKey: ['pizzas', 'categoria', categoria],
    queryFn: async () => {
      const pizzas = await buscarPizzas();
      return pizzas.filter((pizza) => pizza.categoria === categoria);
    },
    enabled: Boolean(categoria),
  });
}
