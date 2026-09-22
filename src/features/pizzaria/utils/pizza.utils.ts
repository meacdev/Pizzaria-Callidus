/**
 * @file pizza.utils.ts
 * @brief Funções de busca, montagem de carrinho, rotulagem e cálculo de promoção de pizzas do cardápio.
 */
import type { Pizza } from '../types/pizza';

/**
 * @brief Data de hoje no formato "AAAA-MM-DD" (fuso local), para comparar com o intervalo de uma promoção.
 * @return Data de hoje formatada.
 */
function hojeIso(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * @brief Indica se uma pizza está com desconto temporário ativo hoje.
 * @param pizza Pizza a verificar.
 * @param hoje Data de referência no formato "AAAA-MM-DD" (padrão: hoje, no fuso local).
 * @return `true` se a pizza tem um `desconto` configurado, com percentual maior que zero, cujo intervalo [inicio, fim] inclui a data de referência.
 */
export function pizzaEmPromocao(pizza: Pizza, hoje: string = hojeIso()): boolean {
  const desconto = pizza.desconto;
  if (!desconto || desconto.percentual <= 0) return false;
  return desconto.inicio <= hoje && hoje <= desconto.fim;
}

/**
 * @brief Calcula o preço promocional de uma pizza (preço base menos o percentual de desconto), arredondado a 2 casas.
 * @param pizza Pizza em promoção (@see pizzaEmPromocao).
 * @return O preço com desconto aplicado; o próprio `precoBase` (convertido) se a pizza não estiver em promoção.
 */
export function precoComDesconto(pizza: Pizza): number {
  const precoBase = Number(pizza.precoBase) || 0;
  if (!pizzaEmPromocao(pizza)) return precoBase;
  const percentual = pizza.desconto?.percentual ?? 0;
  return Math.round(precoBase * (1 - percentual / 100) * 100) / 100;
}

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
