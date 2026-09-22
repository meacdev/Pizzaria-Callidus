/**
 * @file customization.ts
 * @brief Tipos e valores padrão da customização visual/operacional da loja (painel administrativo).
 *
 * @details
 * `Customization` é o formato salvo/consumido por @see CustomizationContext
 * e usado para montar o tema dinâmico da loja (@see providers.tsx).
 */

/** @brief Dias da semana, usados como chave do horário de funcionamento. */
export type DiaSemana =
    | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

/** @brief Horário de funcionamento de um dia da semana. */
export interface HorarioDia {
    ativo: boolean;
    abertura: string; // "18:00"
    fechamento: string; // "23:00"
}

/** @brief Configurações de customização da loja: identidade visual, contato, horários, pagamento e entrega. */
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

/** @brief Dias da semana na ordem de exibição (segunda a domingo). */
export const DIAS_SEMANA_ORDEM: readonly DiaSemana[] = [
    'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo',
];

/** @brief Rótulos em português para cada dia da semana. */
export const DIA_SEMANA_LABEL: Record<DiaSemana, string> = {
    segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta',
    sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
};

/**
 * @brief Cria um horário padrão (18:00–23:00) para um dia, ativo ou não.
 * @param ativo Se a loja funciona nesse dia.
 * @return Horário padrão do dia.
 */
function horarioPadrao(ativo: boolean): HorarioDia {
    return { ativo, abertura: '18:00', fechamento: '23:00' };
}

/** @brief Valores padrão de customização usados enquanto a loja ainda não salvou uma configuração própria. */
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