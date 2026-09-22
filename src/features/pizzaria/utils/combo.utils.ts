/**
 * @file combo.utils.ts
 * @brief Funções de busca e rotulagem de combos do cardápio.
 */
import type { Combo } from '../types/combo';

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
 * @brief Filtra combos cujo nome, descrição, categoria ou itens contenham o termo buscado.
 * @param combos Lista de combos a filtrar.
 * @param termo Termo de busca digitado pelo usuário.
 * @return Combos que casam com o termo; a lista completa se o termo for vazio.
 */
export function filtrarCombosPorTermo(
  combos: readonly Combo[],
  termo: string,
): readonly Combo[] {
  const termoNormalizado = normalizarTexto(termo);

  if (!termoNormalizado) return combos;

  return combos.filter((combo) => {
    const campos = [
      combo.nome,
      combo.descricao,
      combo.categoria,
      ...combo.itens,
    ];

    return campos.some((campo) =>
      normalizarTexto(campo).includes(termoNormalizado),
    );
  });
}

/**
 * @brief Retorna o nome em português (com inicial maiúscula) de uma categoria de combo.
 * @param categoria Categoria do combo.
 * @return Nome da categoria formatado para exibição.
 */
export function nomeCategoriaCombo(
  categoria: Combo['categoria'],
): string {
  const nomes: Record<Combo['categoria'], string> = {
    família: 'Família',
    casal: 'Casal',
    individual: 'Individual',
    promoção: 'Promoção',
    especial: 'Especial',
    doce: 'Doce',
  };

  return nomes[categoria];
}