import type { FormaPagamento } from './checkout';

export type EstadoPagamento =
  | 'formulario'
  | 'processando'
  | 'sucesso';

export interface DadosCartao {
  readonly numero: string;
  readonly nomeImpresso: string;
  readonly validade: string;
  readonly cvv: string;
  readonly parcelas: number;
}

export type CampoCartao = 'numero' | 'nomeImpresso' | 'validade' | 'cvv';

export type ErrosCartao = Partial<Record<CampoCartao, string>>;

export const DADOS_CARTAO_INICIAIS: DadosCartao = {
  numero: '',
  nomeImpresso: '',
  validade: '',
  cvv: '',
  parcelas: 1,
};

export const OPCOES_PARCELAS: readonly number[] = [1, 2, 3, 4, 5, 6];

export interface InfoPagamentoSimulado {
  readonly forma: FormaPagamento;
  readonly identificador: string;
  readonly detalhes: Readonly<Record<string, string | number>>;
  readonly confirmadoEm: string;
}