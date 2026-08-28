import { DIAS_SEMANA_ORDEM, type Customization, type DiaSemana } from '../types/customization';

const MAPA_DIA_JS: readonly DiaSemana[] = [
    'domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado',
];

export function diaSemanaAtual(): DiaSemana {
    return MAPA_DIA_JS[new Date().getDay()];
}

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