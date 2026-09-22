/**
 * @file checkout.ts
 * @brief Tipos e dados iniciais do fluxo de checkout do carrinho.
 */

/** @brief Formas de pagamento aceitas no checkout do site. */
export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

/** @brief Dados de identificação do cliente informados no checkout. */
export interface DadosCliente {
  readonly nome: string;
  readonly email: string;
  readonly telefone: string;
  readonly cpf: string;
}

/** @brief Endereço de entrega informado no checkout. */
export interface EnderecoEntrega {
  readonly cep: string;
  readonly rua: string;
  readonly numero: string;
  readonly complemento: string;
  readonly bairro: string;
  readonly cidade: string;
}

/** @brief Conjunto completo de dados preenchidos pelo cliente no checkout. */
export interface DadosCheckout {
  readonly cliente: DadosCliente;
  readonly endereco: EnderecoEntrega;
  readonly formaPagamento: FormaPagamento | '';
  readonly trocoPara: string;
  readonly observacoes: string;
}

/** @brief Nome de cada campo validável do formulário de checkout, usado como chave de erro. */
export type CampoCheckout =
  | 'nome'
  | 'email'
  | 'telefone'
  | 'cpf'
  | 'cep'
  | 'rua'
  | 'numero'
  | 'complemento'
  | 'bairro'
  | 'cidade'
  | 'formaPagamento'
  | 'trocoPara';

/** @brief Mapa de mensagens de erro por campo do checkout, preenchido apenas nos campos inválidos. */
export type ErrosCheckout = Partial<Record<CampoCheckout, string>>;

/** @brief Estado inicial (vazio) do formulário de checkout. */
export const DADOS_CHECKOUT_INICIAIS: DadosCheckout = {
  cliente: { nome: '', email: '', telefone: '', cpf: '' },
  endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: ''},
  formaPagamento: '',
  trocoPara: '',
  observacoes: '',
};

/** @brief Percentuais de gorjeta oferecidos ao cliente no checkout. */
export const OPCOES_GORJETA: readonly number[] = [0, 5, 10, 15];

/** @brief Opções de forma de pagamento exibidas no checkout, com rótulo e descrição para o usuário. */
export const FORMAS_PAGAMENTO: readonly { readonly valor: FormaPagamento; readonly rotulo: string; readonly descricao: string }[] = [
  { valor: 'pix', rotulo: 'Pix', descricao: 'Pagamento instantâneo, chave enviada após a confirmação.' },
  { valor: 'cartao', rotulo: 'Cartão', descricao: 'Crédito ou débito na entrega.' },
  { valor: 'dinheiro', rotulo: 'Dinheiro', descricao: 'Pagamento em espécie na entrega.' },
];