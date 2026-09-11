/**
 * @file pizza.service.ts
 * @brief Serviço de acesso ao catálogo de pizzas, com cache em localStorage e normalização dos dados.
 *
 * @details
 * Diferente de @see bebida.service.ts e @see combo.service.ts, aqui os
 * dados são cacheados em localStorage (`STORAGE_KEY`) e "normalizados"
 * (funções `normalizar*`) para tolerar formatos inválidos ou incompletos
 * vindos do cache ou do arquivo estático.
 */
import type {
  Ingrediente,
  Pizza,
  TamanhosDisponiveis,
} from '../types/pizza';

const ENDPOINT = `${import.meta.env.BASE_URL}api/todasPizzas.json`;
const STORAGE_KEY = 'pizzaria_pizzas';

const TAMANHOS_PADRAO: readonly TamanhosDisponiveis[] = [
  'P',
  'M',
  'G',
];

/** @brief Normaliza uma lista de ingredientes de origem não confiável (cache/JSON), descartando itens inválidos. */
function normalizarIngredientes(
  ingredientes: unknown,
): Ingrediente[] {
  if (!Array.isArray(ingredientes)) {
    return [];
  }

  return ingredientes
    .filter(
      (ingrediente): ingrediente is Record<string, unknown> =>
        typeof ingrediente === 'object' &&
        ingrediente !== null,
    )
    .map((ingrediente) => ({
      id:
        typeof ingrediente.id === 'string'
          ? ingrediente.id
          : crypto.randomUUID(),
      nome:
        typeof ingrediente.nome === 'string'
          ? ingrediente.nome
          : '',
    }))
    .filter((ingrediente) => ingrediente.nome.trim() !== '');
}

/** @brief Normaliza os tamanhos disponíveis de uma pizza, caindo para os tamanhos padrão (P/M/G) quando inválidos. */
function normalizarTamanhos(
  tamanhos: unknown,
): TamanhosDisponiveis[] {
  if (!Array.isArray(tamanhos)) {
    return [...TAMANHOS_PADRAO];
  }

  const tamanhosValidos = tamanhos.filter(
    (tamanho): tamanho is TamanhosDisponiveis =>
      tamanho === 'P' ||
      tamanho === 'M' ||
      tamanho === 'G' ||
      tamanho === 'F',
  );

  if (tamanhosValidos.length === 0) {
    return [...TAMANHOS_PADRAO];
  }

  return [...new Set(tamanhosValidos)];
}

/**
 * @brief Normaliza os dados de uma pizza, preenchendo valores padrão sensatos para campos ausentes ou inválidos.
 * @param pizza Dados brutos (parciais) da pizza.
 * @param indice Posição da pizza na lista, usada para gerar nome/slug/id de fallback.
 * @return A pizza normalizada.
 */
function normalizarPizza(
  pizza: Partial<Pizza>,
  indice: number,
): Pizza {
  return {
    id:
      typeof pizza.id === 'string'
        ? pizza.id
        : crypto.randomUUID(),

    nome:
      typeof pizza.nome === 'string'
        ? pizza.nome
        : `Pizza ${indice + 1}`,

    slug:
      typeof pizza.slug === 'string'
        ? pizza.slug
        : `pizza-${indice + 1}`,

    descricao:
      typeof pizza.descricao === 'string'
        ? pizza.descricao
        : '',

    precoBase:
      typeof pizza.precoBase === 'string'
        ? pizza.precoBase
        : String(pizza.precoBase ?? '0'),

    imgURL:
      typeof pizza.imgURL === 'string'
        ? pizza.imgURL
        : '',

    categoria:
      pizza.categoria === 'doce' ||
      pizza.categoria === 'artesanal' ||
      pizza.categoria === 'tradicional'
        ? pizza.categoria
        : 'tradicional',

    tamanhosDisponiveis:
      normalizarTamanhos(pizza.tamanhosDisponiveis),

    permiteBorda:
      typeof pizza.permiteBorda === 'boolean'
        ? pizza.permiteBorda
        : true,

    ingredientes:
      normalizarIngredientes(pizza.ingredientes),
  };
}

/** @brief Normaliza uma lista de pizzas de origem não confiável (cache/JSON). */
function normalizarPizzas(
  pizzas: unknown,
): Pizza[] {
  if (!Array.isArray(pizzas)) {
    return [];
  }

  return pizzas.map((pizza, indice) =>
    normalizarPizza(
      pizza as Partial<Pizza>,
      indice,
    ),
  );
}

/**
 * @brief Busca as pizzas do cardápio, usando o cache local quando disponível e buscando do servidor caso contrário.
 * @return Lista de pizzas normalizada.
 */
export async function buscarPizzas(): Promise<Pizza[]> {
  const cache = localStorage.getItem(STORAGE_KEY);

  if (cache) {
    try {
      const pizzasCache = JSON.parse(cache);

      const pizzasNormalizadas =
        normalizarPizzas(pizzasCache);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(pizzasNormalizadas),
      );

      return pizzasNormalizadas;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const resposta = await fetch(ENDPOINT);

  if (!resposta.ok) {
    throw new Error(
      `Falha ao carregar: ${resposta.status}`,
    );
  }

  const dados = await resposta.json();

  const pizzas = normalizarPizzas(dados);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(pizzas),
  );

  return pizzas;
}

/** @brief Normaliza e salva a lista de pizzas no cache local (localStorage). @param pizzas Pizzas a salvar. */
export function salvarPizzas(
  pizzas: Pizza[],
): void {
  const pizzasNormalizadas =
    normalizarPizzas(pizzas);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(pizzasNormalizadas),
  );
}