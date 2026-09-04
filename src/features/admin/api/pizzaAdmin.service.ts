import type { Categoria, Ingrediente, Pizza, TamanhosDisponiveis } from '../../pizzaria/types/pizza';
import { buscarPizzas, criarPizza, atualizarPizza, excluirPizza } from '../../pizzaria/api/pizza.service';

export interface PizzaFormData {
  nome: string;
  precoBase: string;
  categoria: Categoria;
  imgURL: string;
  ingredientes: string;
  tamanhosDisponiveis?: TamanhosDisponiveis[];
  permiteBorda?: boolean;
}

function slug(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function ingredientes(texto: string): Ingrediente[] {
  return texto.split(',').map((nome) => nome.trim()).filter(Boolean).map((nome) => ({ id: slug(nome), nome }));
}
function montar(dados: PizzaFormData): Omit<Pizza, 'id'> {
  return {
    nome: dados.nome, slug: slug(dados.nome), descricao: dados.nome, precoBase: dados.precoBase,
    imgURL: dados.imgURL, categoria: dados.categoria,
    tamanhosDisponiveis: dados.tamanhosDisponiveis?.length ? [...new Set(dados.tamanhosDisponiveis)] : ['P', 'M', 'G'],
    permiteBorda: dados.permiteBorda ?? true, ingredientes: ingredientes(dados.ingredientes),
  };
}
export async function listarPizzasAdmin() { return buscarPizzas(); }
export async function criarPizzaAdmin(dados: PizzaFormData) { return criarPizza(montar(dados)); }
export async function atualizarPizzaAdmin(id: string, dados: PizzaFormData) { return atualizarPizza(id, montar(dados)); }
export async function excluirPizzaAdmin(id: string) { return excluirPizza(id); }
