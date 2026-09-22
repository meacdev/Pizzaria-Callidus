/**
 * @file cupom.utils.ts
 * @brief Funções de validade e formatação dos cupons de desconto.
 */
import type { Cupom } from '../types/cupom';

/**
 * @brief Indica se um cupom está disponível para uso agora (ativo e dentro da validade).
 * @param cupom Cupom a verificar.
 * @param hoje Data de referência no formato "AAAA-MM-DD" (padrão: hoje, no fuso local).
 * @return `true` se o cupom está marcado como ativo e (sem `validoAte`, ou `validoAte` maior ou igual a hoje).
 */
export function cupomDisponivel(cupom: Cupom, hoje: string = new Date().toISOString().slice(0, 10)): boolean {
    if (!cupom.ativo) return false;
    if (!cupom.validoAte) return true;
    return cupom.validoAte >= hoje;
}

/**
 * @brief Formata o valor do desconto de um cupom para exibição (ex.: "10% OFF" ou "R$ 5 OFF").
 * @param cupom Cupom cujo desconto será formatado.
 * @return Texto curto pronto para exibir no card/carrossel do cupom.
 */
export function formatarDescontoCupom(cupom: Cupom): string {
    if (cupom.tipoDesconto === 'percentual') {
        return `${cupom.valor}% OFF`;
    }
    return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cupom.valor)} OFF`;
}
