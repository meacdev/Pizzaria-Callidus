import { createBrowserRouter } from 'react-router';

// Loja
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

// Placeholders — seu amigo substitui por páginas reais depois
const AdminCardapioPage = () => (
  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h1>Gestão de Cardápio</h1>
    <p>Página em construção. Substitua esse placeholder pelo componente real.</p>
  </div>
);

const AdminPedidosPage = () => (
  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h1>Gestão de Pedidos</h1>
    <p>Página em construção. Substitua esse placeholder pelo componente real.</p>
  </div>
);

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
      { index: true, Component: LoginPage },
      {
        path: 'customizacao',
        element: (
          <ProtectedRoute>
            <CustomizationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cardapio',
        element: (
          <ProtectedRoute>
            <AdminCardapioPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pedidos',
        element: (
          <ProtectedRoute>
            <AdminPedidosPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);