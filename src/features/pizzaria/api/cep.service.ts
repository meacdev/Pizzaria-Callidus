/**
 * @file cep.service.ts
 * @brief Serviço de consulta de endereço por CEP usando a API pública ViaCEP.
 */

/** @brief Endereço resolvido a partir de um CEP. */
export interface EnderecoViaCep {
  readonly rua: string;
  readonly bairro: string;
  readonly cidade: string;
}

/** @brief Formato bruto da resposta da API ViaCEP. */
interface RespostaViaCep {
  readonly erro?: boolean;
  readonly logradouro?: string;
  readonly bairro?: string;
  readonly localidade?: string;
}

/**
 * @brief Consulta o endereço correspondente a um CEP na API ViaCEP.
 * @param cep CEP a consultar (com ou sem máscara — só os dígitos são usados).
 * @param signal AbortSignal opcional para cancelar a requisição.
 * @return Endereço encontrado, ou null quando o CEP não existe.
 */
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