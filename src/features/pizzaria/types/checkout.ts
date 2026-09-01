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
  readonly estado: string;
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
  | 'estado'
  | 'formaPagamento'
  | 'trocoPara';

export type ErrosCheckout = Partial<Record<CampoCheckout, string>>;

export const DADOS_CHECKOUT_INICIAIS: DadosCheckout = {
  cliente: { nome: '', email: '', telefone: '', cpf: '' },
  endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
  formaPagamento: '',
  trocoPara: '',
  observacoes: '',
};

export const ESTADOS_BRASILEIROS: readonly { readonly sigla: string; readonly nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

export const FORMAS_PAGAMENTO: readonly { readonly valor: FormaPagamento; readonly rotulo: string; readonly descricao: string }[] = [
  { valor: 'pix', rotulo: 'Pix', descricao: 'Pagamento instantâneo, chave enviada após a confirmação.' },
  { valor: 'cartao', rotulo: 'Cartão', descricao: 'Crédito ou débito na entrega.' },
  { valor: 'dinheiro', rotulo: 'Dinheiro', descricao: 'Pagamento em espécie na entrega.' },
];