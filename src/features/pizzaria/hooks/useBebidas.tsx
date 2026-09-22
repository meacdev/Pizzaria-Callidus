/**
 * @file useBebidas.tsx
 * @brief Hooks de consulta (react-query) para o catálogo de bebidas.
 */
import { useQuery } from '@tanstack/react-query';
import { buscarBebidas } from '../api/bebida.service';

/** @brief Busca a lista completa de bebidas do cardápio. */
export function useBebidas() {
  return useQuery({
    queryKey: ['bebidas'],
    queryFn: buscarBebidas,
  });
}

/**
 * @brief Busca uma bebida específica pelo id.
 * @param id Id da bebida (undefined desativa a consulta).
 * @return Bebida encontrada, ou undefined se não existir.
 */
export function useBebidaPorId(
  id: string | undefined,
) {
  return useQuery({
    queryKey: ['bebidas', 'id', id],
    queryFn: async () => {
      const bebidas = await buscarBebidas();
      return bebidas.find(
        (bebida) => String(bebida.id) === id,
      );
    },
    enabled: Boolean(id),
  });
}