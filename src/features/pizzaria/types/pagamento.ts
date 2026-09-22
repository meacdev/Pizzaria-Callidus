/**
 * @file pagamento.ts
 * @brief Tipos do fluxo de pagamento simulado do checkout (cartão, pix e dinheiro).
 */
import type { FormaPagamento } from './checkout';

/** @brief Etapa atual do processamento de pagamento simulado na tela de checkout. */
export type EstadoPagamento =
  | 'formulario'
  | 'processando'
  | 'sucesso';

/** @brief Dados do cartão informados no formulário de pagamento. */
export interface DadosCartao {
  readonly numero: string;
  readonly nomeImpresso: string;
  readonly validade: string;
  readonly cvv: string;
  readonly parcelas: number;
}

/** @brief Nome de cada campo validável do formulário de cartão, usado como chave de erro. */
export type CampoCartao = 'numero' | 'nomeImpresso' | 'validade' | 'cvv';

/** @brief Mapa de mensagens de erro por campo do cartão, preenchido apenas nos campos inválidos. */
export type ErrosCartao = Partial<Record<CampoCartao, string>>;

/** @brief Estado inicial (vazio) do formulário de dados do cartão. */
export const DADOS_CARTAO_INICIAIS: DadosCartao = {
  numero: '',
  nomeImpresso: '',
  validade: '',
  cvv: '',
  parcelas: 1,
};

/** @brief Quantidades de parcelas oferecidas no pagamento por cartão. */
export const OPCOES_PARCELAS: readonly number[] = [1, 2, 3, 4, 5, 6];

/** @brief Resultado de um pagamento simulado, usado para compor o pedido final enviado ao backend. */
export interface InfoPagamentoSimulado {
  readonly forma: FormaPagamento;
  readonly identificador: string;
  readonly detalhes: Readonly<Record<string, string | number>>;
  readonly confirmadoEm: string;
}