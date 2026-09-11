/**
 * @file periodo.utils.ts
 * @brief Cálculo do intervalo de datas de um período de relatório (dia/semana/mês/ano) e seus rótulos.
 */
import type { PeriodoRelatorio } from '../types/relatorio';

/**
 * @brief Calcula o intervalo [início, fim] do período "atual" (hoje / esta
 * semana / este mês / este ano) a partir de uma data de referência
 * qualquer dentro do período (normalmente `new Date()`).
 * @param periodo Tipo de período a calcular.
 * @param referencia Data de referência dentro do período (padrão: agora).
 * @return Início e fim do período, com hora zerada/máxima respectivamente.
 */
export function intervaloPeriodoAtual(
    periodo: PeriodoRelatorio,
    referencia: Date = new Date(),
): { inicio: Date; fim: Date } {
    const inicio = new Date(referencia);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(referencia);
    fim.setHours(23, 59, 59, 999);

    if (periodo === 'dia') {
        return { inicio, fim };
    }

    if (periodo === 'semana') {
        // Semana começando no domingo.
        const diaDaSemana = inicio.getDay();
        inicio.setDate(inicio.getDate() - diaDaSemana);
        fim.setTime(inicio.getTime());
        fim.setDate(fim.getDate() + 6);
        fim.setHours(23, 59, 59, 999);
        return { inicio, fim };
    }

    if (periodo === 'mes') {
        inicio.setDate(1);
        const fimDoMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0);
        fimDoMes.setHours(23, 59, 59, 999);
        return { inicio, fim: fimDoMes };
    }

    // ano
    inicio.setMonth(0, 1);
    const fimDoAno = new Date(inicio.getFullYear(), 11, 31);
    fimDoAno.setHours(23, 59, 59, 999);
    return { inicio, fim: fimDoAno };
}

/** @brief Rótulos em português para cada período de relatório. */
export const PERIODO_LABEL: Record<PeriodoRelatorio, string> = {
    dia: 'Dia',
    semana: 'Semana',
    mes: 'Mês',
    ano: 'Ano',
};
