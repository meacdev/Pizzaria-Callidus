import { createBrowserRouter } from 'react-router';

//Loja

import { Layout } from '../component/Layout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { CardapioPage } from '../features/pizzaria/pages/CardapioPage';
import { CategoriaPage } from '../features/pizzaria/pages/CategoriaPage';
import { CarrinhoPage } from '../features/pizzaria/pages/CarrinhoPage';
import { CheckoutPage } from '../features/pizzaria/pages/CheckoutPage';
import { PagamentoPage } from '../features/pizzaria/pages/PagamentoPage';
import { PizzaDetalhePage } from '../features/pizzaria/pages/PizzaDetalhePage';

// Admin

import { LoginPage } from '../features/admin/pages/LoginPage';
import { CustomizationPage } from '../features/admin/pages/CustomizationPage';
import { ProtectedRoute } from '../features/admin/guards/ProtectedRoute';

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
      { path: 'checkout', Component: CheckoutPage },
      { path: 'pagamento', Component: PagamentoPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: 'admin',
    children: [
      { index: true, Component: LoginPage }, // /admin -> login
      {
        path: 'customizacao',
        element: (
          <ProtectedRoute>
            <CustomizationPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
