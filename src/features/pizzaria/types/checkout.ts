export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

export interface DadosCliente {
  readonly nome: string;
  readonly email: string;
  readonly telefone: string;
  readonly cpf: string;
}

export interface EnderecoEntrega {
  readonly cep: string;
  readonly rua: string;
  readonly numero: string;
  readonly complemento: string;
  readonly bairro: string;
  readonly cidade: string;
}

export interface DadosCheckout {
  readonly cliente: DadosCliente;
  readonly endereco: EnderecoEntrega;
  readonly formaPagamento: FormaPagamento | '';
  readonly trocoPara: string;
  readonly observacoes: string;
}

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

export type ErrosCheckout = Partial<Record<CampoCheckout, string>>;

export const DADOS_CHECKOUT_INICIAIS: DadosCheckout = {
  cliente: { nome: '', email: '', telefone: '', cpf: '' },
  endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: ''},
  formaPagamento: '',
  trocoPara: '',
  observacoes: '',
};

export const OPCOES_GORJETA: readonly number[] = [0, 5, 10, 15];

export const FORMAS_PAGAMENTO: readonly { readonly valor: FormaPagamento; readonly rotulo: string; readonly descricao: string }[] = [
  { valor: 'pix', rotulo: 'Pix', descricao: 'Pagamento instantâneo, chave enviada após a confirmação.' },
  { valor: 'cartao', rotulo: 'Cartão', descricao: 'Crédito ou débito na entrega.' },
  { valor: 'dinheiro', rotulo: 'Dinheiro', descricao: 'Pagamento em espécie na entrega.' },
];