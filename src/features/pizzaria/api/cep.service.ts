export interface EnderecoViaCep {
  readonly rua: string;
  readonly bairro: string;
  readonly cidade: string;
}

interface RespostaViaCep {
  readonly erro?: boolean;
  readonly logradouro?: string;
  readonly bairro?: string;
  readonly localidade?: string;
}

export async function buscarEnderecoPorCep(
  cep: string,
  signal?: AbortSignal,
): Promise<EnderecoViaCep | null> {
  const digitos = cep.replace(/\D/g, '');

  const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, { signal });

  if (!resposta.ok) {
    throw new Error(`Falha ao consultar o CEP: ${resposta.status}`);
  }

  const dados = (await resposta.json()) as RespostaViaCep;

  if (dados.erro) return null;

  return {
    rua: dados.logradouro ?? '',
    bairro: dados.bairro ?? '',
    cidade: dados.localidade ?? '',
  };
}