import { useQuery } from '@tanstack/react-query';
import { buscarPizzas } from '../api/pizza.service';
import type { Categoria } from '../types/pizza';

export function usePizzas() {
  return useQuery({
    queryKey: ['pizzas'],
    queryFn: buscarPizzas,
  });
}

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
