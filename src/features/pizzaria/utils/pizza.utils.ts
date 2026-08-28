import type { Pizza } from '../types/pizza';

export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filtrarPizzasPorTermo(
  pizzas: readonly Pizza[],
  termo: string,
): readonly Pizza[] {
  const termoNormalizado = normalizarTexto(termo);

  if (!termoNormalizado) return pizzas;

  return pizzas.filter((pizza) => {
    const campos = [pizza.nome, pizza.descricao, pizza.categoria];
    return campos.some((campo) => normalizarTexto(campo).includes(termoNormalizado));
  });
}

export interface ItemCarrinho {
  readonly pizza: Pizza;
  readonly quantidade: number;
}

export function obterItensCarrinho(
  pizzas: Pizza[],
  itensCarrinho: Readonly<Record<string, number>>,
): readonly ItemCarrinho[] {
  return pizzas
    .filter((pizza) => (itensCarrinho[pizza.id] ?? 0) > 0)
    .map((pizza) => ({ pizza, quantidade: itensCarrinho[pizza.id] }));
}

export function nomeCategoria(categoria: Pizza['categoria']): string {
  const nomes: Record<Pizza['categoria'], string> = {
    tradicional: 'Tradicional',
    doce: 'Doce',
    artesanal: 'Artesanal',
  };
  return nomes[categoria];
}
