import { useMemo, useState } from 'react';
import { CampoBusca } from '../../../component/CampoBusca';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { ListaPizzas } from '../components/ListaPizzas';
import { ListaBebidas } from '../components/ListaBebidas';
import { ListaCombos } from '../components/ListaCombos';
import { usePizzas } from '../hooks/usePizzas';
import { useBebidas } from '../hooks/useBebidas';
import { useCombos } from '../hooks/useCombo';

import {
  filtrarPizzasPorTermo,
} from '../utils/pizza.utils';

import type {
  Categoria,
  TamanhosDisponiveis,
} from '../types/pizza';

export function CardapioPage() {
  const [termoBusca, setTermoBusca] =
    useState('');

  const [
    categoriaSelecionada,
    setCategoriaSelecionada,
  ] = useState<Categoria | 'todas'>(
    'todas',
  );

  const [
    ingredienteSelecionado,
    setIngredienteSelecionado,
  ] = useState<string>('todos');

  const [
    tamanhoSelecionado,
    setTamanhoSelecionado,
  ] = useState<
    TamanhosDisponiveis | 'todos'
  >('todos');

  const {
    data: pizzas = [],
    isLoading,
    isError,
  } = usePizzas();

  const {
    data: bebidas = [],
    isLoading: isLoadingBebidas,
    isError: isErrorBebidas,
  } = useBebidas();

  const {
    data: combos = [],
    isLoading: isLoadingCombos,
    isError: isErrorCombos,
  } = useCombos();

  /*
   * Lista todos os ingredientes existentes
   * nas pizzas sem assumir que o campo existe.
   */
  const ingredientesDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>();

    pizzas.forEach((pizza) => {
      const ingredientes =
        pizza.ingredientes ?? [];

      ingredientes.forEach((ingrediente) => {
        if (
          ingrediente?.id &&
          ingrediente?.nome
        ) {
          mapa.set(
            ingrediente.id,
            ingrediente.nome,
          );
        }
      });
    });

    return Array.from(mapa.entries())
      .map(([id, nome]) => ({
        id,
        nome,
      }))
      .sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          'pt-BR',
        ),
      );
  }, [pizzas]);

  /*
   * Aplica todos os filtros selecionados.
   */
  const pizzasFiltradas = useMemo(() => {
    let resultado =
      filtrarPizzasPorTermo(
        pizzas,
        termoBusca,
      );

    /*
     * Filtro por categoria
     */
    if (
      categoriaSelecionada !== 'todas'
    ) {
      resultado = resultado.filter(
        (pizza) =>
          pizza.categoria ===
          categoriaSelecionada,
      );
    }

    /*
     * Filtro por ingrediente
     */
    if (
      ingredienteSelecionado !== 'todos'
    ) {
      resultado = resultado.filter(
        (pizza) =>
          (
            pizza.ingredientes ?? []
          ).some(
            (ingrediente) =>
              ingrediente.id ===
              ingredienteSelecionado,
          ),
      );
    }

    /*
     * Filtro por tamanho
     */
    if (
      tamanhoSelecionado !== 'todos'
    ) {
      resultado = resultado.filter(
        (pizza) =>
          (
            pizza.tamanhosDisponiveis ?? []
          ).includes(
            tamanhoSelecionado,
          ),
      );
    }

    return resultado;
  }, [
    pizzas,
    termoBusca,
    categoriaSelecionada,
    ingredienteSelecionado,
    tamanhoSelecionado,
  ]);

  const possuiFiltrosAtivos =
    termoBusca.trim() !== '' ||
    categoriaSelecionada !== 'todas' ||
    ingredienteSelecionado !== 'todos' ||
    tamanhoSelecionado !== 'todos';

  function limparFiltros() {
    setTermoBusca('');
    setCategoriaSelecionada('todas');
    setIngredienteSelecionado('todos');
    setTamanhoSelecionado('todos');
  }

  if (
    isLoading ||
    isLoadingCombos ||
    isLoadingBebidas
  ) {
    return (
      <Loading
        mensagem="Carregando cardápio..."
      />
    );
  }

  if (
    isError ||
    isErrorCombos ||
    isErrorBebidas
  ) {
    return (
      <MensagemErro
        mensagem="Não foi possível carregar o cardápio."
      />
    );
  }

  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">
          Cardápio
        </span>

        <h1>
          Todas as pizzas
        </h1>

        <CampoBusca
          valor={termoBusca}
          rotulo="Buscar no cardápio"
          placeholder="Ex.: Calabresa, Tradicional..."
          onChange={setTermoBusca}
        />

        <div className="filtros-cardapio">
          <div className="filtros-cabecalho">
            <div>
              <h2>
                Filtros
              </h2>

              <p>
                Refine sua busca por
                categoria, ingredientes
                ou tamanho.
              </p>
            </div>

            {possuiFiltrosAtivos && (
              <button
                type="button"
                className="botao-limpar-filtros"
                onClick={
                  limparFiltros
                }
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="filtros-grid">
            {/* Categoria */}
            <div className="filtro-grupo">
              <label htmlFor="filtro-categoria">
                Categoria
              </label>

              <select
                id="filtro-categoria"
                value={
                  categoriaSelecionada
                }
                onChange={(event) =>
                  setCategoriaSelecionada(
                    event.target.value as
                      | Categoria
                      | 'todas',
                  )
                }
              >
                <option value="todas">
                  Todas as categorias
                </option>

                <option value="tradicional">
                  Tradicional
                </option>

                <option value="doce">
                  Doce
                </option>

                <option value="artesanal">
                  Artesanal
                </option>
              </select>
            </div>

            {/* Ingredientes */}
            <div className="filtro-grupo">
              <label htmlFor="filtro-ingrediente">
                Ingredientes
              </label>

              <select
                id="filtro-ingrediente"
                value={
                  ingredienteSelecionado
                }
                onChange={(event) =>
                  setIngredienteSelecionado(
                    event.target.value,
                  )
                }
              >
                <option value="todos">
                  Todos os ingredientes
                </option>

                {ingredientesDisponiveis.map(
                  (ingrediente) => (
                    <option
                      key={ingrediente.id}
                      value={
                        ingrediente.id
                      }
                    >
                      {ingrediente.nome}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Tamanho */}
            <div className="filtro-grupo">
              <label htmlFor="filtro-tamanho">
                Tamanho
              </label>

              <select
                id="filtro-tamanho"
                value={
                  tamanhoSelecionado
                }
                onChange={(event) =>
                  setTamanhoSelecionado(
                    event.target.value as
                      | TamanhosDisponiveis
                      | 'todos',
                  )
                }
              >
                <option value="todos">
                  Todos os tamanhos
                </option>

                <option value="P">
                  Pequena (P)
                </option>

                <option value="M">
                  Média (M)
                </option>

                <option value="G">
                  Grande (G)
                </option>

                <option value="F">
                  Família (F)
                </option>
              </select>
            </div>
          </div>
        </div>

        <p className="resumo-busca">
          {pizzasFiltradas.length} de{' '}
          {pizzas.length} pizza(s)
          encontrada(s).
        </p>
      </main>

      <ListaPizzas
        titulo="Resultado da busca"
        pizzas={pizzasFiltradas}
        compacto
        mensagemVazia="Nenhuma pizza corresponde aos filtros selecionados."
      />

      <ListaCombos
        titulo="Combos"
        combos={combos}
        compacto
      />

      <ListaBebidas
        bebidas={bebidas}
      />
    </>
  );
}