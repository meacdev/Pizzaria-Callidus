/**
 * @file CategoriaPage.tsx
 * @brief Página de listagem de pizzas de uma categoria (rota
 * /cardapio/:categoria).
 */
import { Navigate, useParams } from 'react-router';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { ListaPizzas } from '../components/ListaPizzas';
import { usePizzasPorCategoria } from '../hooks/usePizzas';
import type { Categoria } from '../types/pizza';

/** Nome de exibição de cada categoria de pizza. */
const nomesCategorias: Record<Categoria, string> = { tradicional: 'Tradicional', doce: 'Doce', artesanal: 'Artesanal' };

/** @brief Converte o parâmetro de rota em uma Categoria válida, ou undefined se não reconhecida. */
function normalizarCategoria(categoria: string | undefined): Categoria | undefined {
  if (categoria === 'tradicional' || categoria === 'doce' || categoria === 'artesanal') return categoria;
  return undefined;
}

/** @brief Página com as pizzas da categoria indicada na URL; redireciona para /cardapio se a categoria for inválida. */
export function CategoriaPage() {
  const { categoria: categoriaParam } = useParams<{ categoria: string }>();
  const categoria = normalizarCategoria(categoriaParam);
  const { data: pizzas = [], isLoading, isError } = usePizzasPorCategoria(categoria);
  if (!categoria) return <Navigate to="/cardapio" replace />;
  if (isLoading) return <Loading mensagem={`Carregando pizzas de ${nomesCategorias[categoria]}...`} />;
  if (isError) return <MensagemErro mensagem="Não foi possível carregar as pizzas dessa categoria." />;
  return <ListaPizzas titulo={`Pizzas de ${nomesCategorias[categoria]}`} pizzas={pizzas} compacto mensagemVazia="Nenhuma pizza encontrada nesta categoria." />;
}
