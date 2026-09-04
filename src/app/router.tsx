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
import { BebidaDetalhePage } from '../features/pizzaria/pages/BebidaDetalhePage';
import { ComboDetalhePage } from '../features/pizzaria/pages/ComboDetalhePage';
import { AcompanhamentoPedidoPage } from '../features/pizzaria/pages/AcompanhamentoPedido';
import { EntregadorPage } from '../features/entregador/pages/EntregadorPage';
import { TotemPage } from '../features/totem/pages/TotemPage';

// Admin
import { LoginPage } from '../features/admin/pages/LoginPage';
import { CustomizationPage } from '../features/admin/pages/CustomizationPage';
import { PizzaAdminPage } from '../features/admin/pages/PizzaAdminPage';
import { PedidosAdminPage } from '../features/admin/pages/PedidosAdminPage';
import { ProtectedRoute } from '../features/admin/guards/ProtectedRoute';

// Funcionários (cozinheiro / garçom / entregador)
import { CadastroFuncionarioPage } from '../features/funcionarios/pages/CadastroFuncionarioPage';
import { CozinhaPage } from '../features/funcionarios/pages/CozinhaPage';
import { BalcaoPage } from '../features/funcionarios/pages/BalcaoPage';
import { RoleRoute } from '../features/funcionarios/guards/RoleRoute';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Layout,
      children: [
        { index: true, Component: HomePage },
        { path: 'cardapio', Component: CardapioPage },
        { path: 'categoria', Component: CategoriaPage },
        { path: 'pizza/:slug', Component: PizzaDetalhePage },
        { path: 'bebida/:id', Component: BebidaDetalhePage },
        { path: 'combo/:slug', Component: ComboDetalhePage },
        { path: 'carrinho', Component: CarrinhoPage },
        { path: 'checkout', Component: CheckoutPage },
        { path: 'pagamento', Component: PagamentoPage },
        { path: 'pedido/:id', Component: AcompanhamentoPedidoPage },
        { path: '*', Component: NotFoundPage },
      ],
    },
    {
      // Totem de autoatendimento: tela cheia, sem o cabeçalho/rodapé da
      // loja — pensado para rodar num tablet/quiosque dentro do
      // restaurante, por isso fica fora do Layout da loja.
      path: 'totem',
      Component: TotemPage,
    },
    {
      path: 'admin',
      children: [
        // Login dos funcionários (cozinheiro/garçom/entregador): identifica
        // o cargo pelo login+senha e manda para /cozinha, /balcao ou /entrega.
        { index: true, Component: LoginPage },
        { path: 'cadastro', Component: CadastroFuncionarioPage },
        {
          path: 'cozinha',
          element: (
            <RoleRoute cargo="cozinheiro">
              <CozinhaPage />
            </RoleRoute>
          ),
        },
        {
          path: 'balcao',
          element: (
            <RoleRoute cargo="garcom">
              <BalcaoPage />
            </RoleRoute>
          ),
        },
        {
          // Painel do entregador (rota de pedidos), feito pelo colega do
          // Matheus — mantido igual, só passou a exigir login de entregador.
          path: 'entrega',
          element: (
            <RoleRoute cargo="entregador">
              <EntregadorPage />
            </RoleRoute>
          ),
        },

        // Páginas antigas (customização, cardápio, pedidos): a customização
        // vai ganhar sua própria rota de login mais pra frente e não deve
        // ser alcançada por este login de funcionário. Ficam com o
        // guard/login antigos (ProtectedRoute + AuthContext).
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
              <PizzaAdminPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'pedidos',
          element: (
            <ProtectedRoute>
              <PedidosAdminPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);