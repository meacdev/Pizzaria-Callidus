import type { Categoria, Ingrediente, Pizza } from '../../pizzaria/types/pizza';
import { buscarPizzas, salvarPizzas } from '../../pizzaria/api/pizza.service';

export interface PizzaFormData {
    nome: string;
    precoBase: string;
    categoria: Categoria;
    imgURL: string;
    ingredientes: string;
}

function gerarSlug(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function converterIngredientes(texto: string): Ingrediente[] {
    return texto
        .split(',')
        .map((nome) => nome.trim())
        .filter(Boolean)
        .map((nome) => ({ id: gerarSlug(nome), nome }));
}

function montarPizza(dados: PizzaFormData, id: string): Pizza {
    return {
        id,
        nome: dados.nome,
        slug: gerarSlug(dados.nome),
        descricao: dados.nome,
        precoBase: dados.precoBase,
        imgURL: dados.imgURL,
        categoria: dados.categoria,
        tamanhosDisponiveis: ['P', 'M', 'G'],
        permiteBorda: true,
        ingredientes: converterIngredientes(dados.ingredientes),
    };
}

export async function listarPizzasAdmin(): Promise<Pizza[]> {
    return buscarPizzas();
}

export async function criarPizzaAdmin(dados: PizzaFormData): Promise<Pizza> {
    const pizzas = await buscarPizzas();
    const novaPizza = montarPizza(dados, crypto.randomUUID());
    salvarPizzas([...pizzas, novaPizza]);
    return novaPizza;
}

export async function atualizarPizzaAdmin(id: string, dados: PizzaFormData): Promise<Pizza> {
    const pizzas = await buscarPizzas();
    const pizzaAtualizada = montarPizza(dados, id);
    salvarPizzas(pizzas.map((pizza) => (pizza.id === id ? pizzaAtualizada : pizza)));
    return pizzaAtualizada;
}

export async function excluirPizzaAdmin(id: string): Promise<void> {
    const pizzas = await buscarPizzas();
    salvarPizzas(pizzas.filter((pizza) => pizza.id !== id));
}
