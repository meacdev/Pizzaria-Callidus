/**
 * @file customization.utils.ts
 * @brief Funções utilitárias sobre a customização da loja: dia da semana atual e se a loja está aberta.
 */
import { DIAS_SEMANA_ORDEM, type Customization, type DiaSemana } from '../types/customization';

/** @brief Mapa do índice de `Date.getDay()` (0 = domingo) para o `DiaSemana` correspondente. */
const MAPA_DIA_JS: readonly DiaSemana[] = [
    'domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado',
];

/** @brief Retorna o dia da semana atual no formato `DiaSemana`. */
export function diaSemanaAtual(): DiaSemana {
    return MAPA_DIA_JS[new Date().getDay()];
}

/**
 * @brief Verifica se a loja está aberta agora, com base no horário configurado para o dia atual.
 * @param customization Customização da loja, com os horários de funcionamento.
 * @return `true` se o dia atual estiver ativo e o horário atual estiver dentro do expediente.
 */
export function estaAberto(customization: Customization): boolean {
    const horarioHoje = customization.horarios[diaSemanaAtual()];
    if (!horarioHoje.ativo) return false;

    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const [hAbre, mAbre] = horarioHoje.abertura.split(':').map(Number);
    const [hFecha, mFecha] = horarioHoje.fechamento.split(':').map(Number);

    return minutosAgora >= hAbre * 60 + mAbre && minutosAgora < hFecha * 60 + mFecha;
}

export { DIAS_SEMANA_ORDEM };