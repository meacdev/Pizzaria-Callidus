/**
 * @file pizza.utils.ts
 * @brief Funções de busca, montagem de carrinho e rotulagem de pizzas do cardápio.
 */
import type { Pizza } from '../types/pizza';

/**
 * @brief Normaliza um texto removendo acentos, convertendo para minúsculas e aparando espaços, para comparação de busca.
 * @param texto Texto a normalizar.
 * @return Texto normalizado.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * @brief Filtra pizzas cujo nome, descrição ou categoria contenham o termo buscado.
 * @param pizzas Lista de pizzas a filtrar.
 * @param termo Termo de busca digitado pelo usuário.
 * @return Pizzas que casam com o termo; a lista completa se o termo for vazio.
 */
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

/** @brief Item simplificado de carrinho usado internamente para listar pizzas com quantidade maior que zero. */
export interface ItemCarrinho {
  readonly pizza: Pizza;
  readonly quantidade: number;
}

/**
 * @brief Monta a lista de itens de carrinho a partir de um mapa de quantidades por id de pizza.
 * @param pizzas Lista de pizzas do cardápio.
 * @param itensCarrinho Mapa de quantidade por id de pizza.
 * @return Itens de carrinho cuja quantidade é maior que zero.
 */
export function obterItensCarrinho(
  pizzas: Pizza[],
  itensCarrinho: Readonly<Record<string, number>>,
): readonly ItemCarrinho[] {
  return pizzas
    .filter((pizza) => (itensCarrinho[pizza.id] ?? 0) > 0)
    .map((pizza) => ({ pizza, quantidade: itensCarrinho[pizza.id] }));
}

/**
 * @brief Retorna o nome em português (com inicial maiúscula) de uma categoria de pizza.
 * @param categoria Categoria da pizza.
 * @return Nome da categoria formatado para exibição.
 */
export function nomeCategoria(categoria: Pizza['categoria']): string {
  const nomes: Record<Pizza['categoria'], string> = {
    tradicional: 'Tradicional',
    doce: 'Doce',
    artesanal: 'Artesanal',
  };
  return nomes[categoria];
}
