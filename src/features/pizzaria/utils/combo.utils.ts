import type { Combo } from '../types/combo';

export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

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