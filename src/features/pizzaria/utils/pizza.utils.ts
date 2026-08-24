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

// talvez usar no carrinho, mas isso com o luis...
export function obterPizzasCarrinho(
  pizzas:  Pizza[],
  carrinho: readonly string[],
): readonly Pizza[] {
  const carrinhoSet = new Set(carrinho);
  return pizzas.filter((pizza) => carrinhoSet.has(pizza.id));
}

export function nomeCategoria(categoria: Pizza['categoria']): string {
  const nomes: Record<Pizza['categoria'], string> = {
    tradicional: 'Tradicional',
    doce: 'Doce',
    artesanal: 'Artesanal',
  };
  return nomes[categoria];
}
