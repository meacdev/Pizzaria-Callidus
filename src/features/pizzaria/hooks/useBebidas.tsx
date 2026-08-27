import { useQuery } from '@tanstack/react-query';
import { buscarBebidas } from '../api/bebida.service';

export function useBebidas() {
  return useQuery({
    queryKey: ['bebidas'],
    queryFn: buscarBebidas,
  });
}

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