import type {
  Categoria,
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