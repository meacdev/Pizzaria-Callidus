export interface Customization {
    logoUrl: string;
    corPrimaria: string;
    corSecundaria: string;
    nomePizzaria: string;
    endereco: string;
    horarioAbertura: string; // "18:00"
    horarioFechamento: string; // "23:00"
    formasPagamento: {
        dinheiro: boolean;
        cartao: boolean;
        pix: boolean;
    };
    taxaEntrega: number;
    raioEntregaKm: number;
    tempoPreparoMinutos: number;
}

export const CUSTOMIZATION_PADRAO: Customization = {
    logoUrl: '',
    corPrimaria: '#e63946',
    corSecundaria: '#1d3557',
    nomePizzaria: 'Minha Pizzaria',
    endereco: '',
    horarioAbertura: '18:00',
    horarioFechamento: '23:00',
    formasPagamento: { dinheiro: true, cartao: true, pix: true },
    taxaEntrega: 0,
    raioEntregaKm: 5,
    tempoPreparoMinutos: 40,
};