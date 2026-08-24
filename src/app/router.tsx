import { createBrowserRouter } from 'react-router';
import { Layout } from '../component/Layout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { CardapioPage } from '../features/pizzaria/pages/CardapioPage';
import { CategoriaPage } from '../features/pizzaria/pages/CategoriaPage';
import { CarrinhoPage } from '../features/pizzaria/pages/CarrinhoPage';
import { PizzaDetalhePage } from '../features/pizzaria/pages/PizzaDetalhePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'cardapio', Component: CardapioPage },
      { path: 'categoria', Component: CategoriaPage },
      { path: 'pizza/:slug', Component: PizzaDetalhePage },
      { path: 'carrinho', Component: CarrinhoPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
