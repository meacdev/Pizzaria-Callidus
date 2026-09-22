/**
 * @file pizzaAdmin.service.ts
 * @brief Serviço de CRUD de pizzas usado pelo painel administrativo.
 *
 * @details
 * Converte os dados de formulário (@see PizzaFormData) para o modelo de
 * domínio `Pizza`, gerando slug e lista de ingredientes, e delega a
 * leitura/persistência ao serviço de pizzas da loja (@see
 * pizza.service.buscarPizzas, @see pizza.service.salvarPizzas).
 */
import type {
  Categoria,
  DescontoPizza,
  Ingrediente,
  Pizza,
  TamanhosDisponiveis,
} from '../../pizzaria/types/pizza';

import {
  buscarPizzas,
  salvarPizzas,
} from '../../pizzaria/api/pizza.service';

/** @brief Dados do formulário de cadastro/edição de pizza no painel administrativo. */
export interface PizzaFormData {
  nome: string;
  precoBase: string;
  categoria: Categoria;
  imgURL: string;
  ingredientes: string;
  tamanhosDisponiveis?: TamanhosDisponiveis[];
  permiteBorda?: boolean;
  /** Desconto temporário ("pizza em promoção"), ou `null` se a pizza não estiver em promoção. */
  desconto?: DescontoPizza | null;
}

const TAMANHOS_PADRAO: TamanhosDisponiveis[] =
  ['P', 'M', 'G'];

/**
 * @brief Gera um slug (sem acentos, minúsculo, separado por hífens) a partir de um texto.
 * @param texto Texto de origem (ex.: nome da pizza ou de um ingrediente).
 * @return O slug gerado.
 */
function gerarSlug(
  texto: string,
): string {
  return texto
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /(^-|-$)/g,
      '',
    );
}

/**
 * @brief Converte a string de ingredientes (separados por vírgula) do formulário em uma lista de `Ingrediente`.
 * @param texto Ingredientes separados por vírgula, como digitados no formulário.
 * @return Lista de ingredientes, cada um com id (slug) e nome.
 */
function converterIngredientes(
  texto: string,
): Ingrediente[] {
  return texto
    .split(',')
    .map((nome) =>
      nome.trim(),
    )
    .filter(Boolean)
    .map((nome) => ({
      id: gerarSlug(nome),
      nome,
    }));
}

/**
 * @brief Monta o objeto `Pizza` completo a partir dos dados do formulário e de um id.
 * @param dados Dados do formulário de pizza.
 * @param id Identificador da pizza (novo ou existente).
 * @return A pizza montada, pronta para ser persistida.
 */
function montarPizza(
  dados: PizzaFormData,
  id: string,
): Pizza {
  const tamanhos =
    dados.tamanhosDisponiveis &&
    dados.tamanhosDisponiveis.length >
      0
      ? dados.tamanhosDisponiveis
      : TAMANHOS_PADRAO;

  return {
    id,

    nome: dados.nome,

    slug: gerarSlug(
      dados.nome,
    ),

    descricao: dados.nome,

    precoBase:
      dados.precoBase,

    imgURL:
      dados.imgURL,

    categoria:
      dados.categoria,

    tamanhosDisponiveis: [
      ...new Set(tamanhos),
    ],

    permiteBorda:
      dados.permiteBorda ??
      true,

    ingredientes:
      converterIngredientes(
        dados.ingredientes,
      ),

    desconto:
      dados.desconto ?? null,
  };
}

/**
 * @brief Lista todas as pizzas cadastradas, para uso no painel administrativo.
 * @return A lista completa de pizzas.
 */
export async function listarPizzasAdmin(): Promise<
  Pizza[]
> {
  return buscarPizzas();
}

/**
 * @brief Cria uma nova pizza a partir dos dados do formulário.
 * @param dados Dados do formulário de cadastro de pizza.
 * @return A pizza recém-criada.
 */
export async function criarPizzaAdmin(
  dados: PizzaFormData,
): Promise<Pizza> {
  const pizzas =
    await buscarPizzas();

  const novaPizza =
    montarPizza(
      dados,
      crypto.randomUUID(),
    );

  salvarPizzas([
    ...pizzas,
    novaPizza,
  ]);

  return novaPizza;
}

/**
 * @brief Atualiza uma pizza existente com os dados do formulário.
 * @param id Identificador da pizza a ser atualizada.
 * @param dados Novos dados do formulário de pizza.
 * @return A pizza atualizada.
 */
export async function atualizarPizzaAdmin(
  id: string,
  dados: PizzaFormData,
): Promise<Pizza> {
  const pizzas =
    await buscarPizzas();

  const pizzaAtualizada =
    montarPizza(
      dados,
      id,
    );

  salvarPizzas(
    pizzas.map((pizza) =>
      pizza.id === id
        ? pizzaAtualizada
        : pizza,
    ),
  );

  return pizzaAtualizada;
}

/**
 * @brief Exclui uma pizza pelo id.
 * @param id Identificador da pizza a ser excluída.
 */
export async function excluirPizzaAdmin(
  id: string,
): Promise<void> {
  const pizzas =
    await buscarPizzas();

  salvarPizzas(
    pizzas.filter(
      (pizza) =>
        pizza.id !== id,
    ),
  );
}