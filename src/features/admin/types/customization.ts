export type DiaSemana =
    | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

export interface HorarioDia {
    ativo: boolean;
    abertura: string; // "18:00"
    fechamento: string; // "23:00"
}

export interface Customization {
    logoUrl: string;
    bannerUrl: string;
    corPrimaria: string;
    corSecundaria: string;
    nomePizzaria: string;
    descricaoCurta: string;
    endereco: string;
    telefone: string;
    whatsapp: string;
    instagram: string;
    horarios: Record<DiaSemana, HorarioDia>;
    formasPagamento: {
        dinheiro: boolean;
        cartao: boolean;
        pix: boolean;
    };
    taxaEntrega: number;
    raioEntregaKm: number;
    tempoPreparoMinutos: number;
}

export const DIAS_SEMANA_ORDEM: readonly DiaSemana[] = [
    'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo',
];

export const DIA_SEMANA_LABEL: Record<DiaSemana, string> = {
    segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta',
    sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
};

function horarioPadrao(ativo: boolean): HorarioDia {
    return { ativo, abertura: '18:00', fechamento: '23:00' };
}

export const CUSTOMIZATION_PADRAO: Customization = {
    logoUrl: '',
    bannerUrl: '',
    corPrimaria: '#ff2a2a',
    corSecundaria: '#1a0d0a',
    nomePizzaria: 'Paradiso Pizzaria',
    descricaoCurta: 'Calma Calabreso!',
    endereco: '',
    telefone: '',
    whatsapp: '',
    instagram: '',
    horarios: {
        segunda: horarioPadrao(false),
        terca: horarioPadrao(true),
        quarta: horarioPadrao(true),
        quinta: horarioPadrao(true),
        sexta: horarioPadrao(true),
        sabado: horarioPadrao(true),
        domingo: horarioPadrao(true),
    },
    formasPagamento: { dinheiro: true, cartao: true, pix: true },
    taxaEntrega: 0,
    raioEntregaKm: 5,
    tempoPreparoMinutos: 40,
};