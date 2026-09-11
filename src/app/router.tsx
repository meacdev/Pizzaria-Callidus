/**
 * @file router.tsx
 * @brief Definição de todas as rotas da aplicação (loja, totem, área de
 * funcionários e painel administrativo).
 *
 * @details
 * Organizado em três grandes grupos: as rotas da loja dentro de
 * `Layout` (@see Layout.tsx), o totem de autoatendimento em tela cheia
 * (@see TotemPage.tsx) e as rotas de funcionários/admin, protegidas por
 * guards específicos (@see ClienteAutenticadoRoute, @see RoleRoute,
 * @see FuncionarioAutenticadoRoute, @see ProtectedRoute).
 */
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
import { UsuarioPage } from '../features/clientes/pages/UsuarioPage';
import { ComprasPage } from '../features/clientes/pages/ComprasPage';
import { ReservarMesaPage } from '../features/clientes/pages/ReservarMesaPage';
import { ClienteAutenticadoRoute } from '../features/clientes/guards/ClienteAutenticadoRoute';

// Admin
import { LoginPage } from '../features/admin/pages/LoginPage';
import { CustomLoginPage } from '../features/admin/pages/CustomLoginPage';
import { CustomizationPage } from '../features/admin/pages/CustomizationPage';
import { PizzaAdminPage } from '../features/admin/pages/PizzaAdminPage';
import { PedidosAdminPage } from '../features/admin/pages/PedidosAdminPage';
import { GerentePage } from '../features/admin/pages/GerentePage';
import { ProtectedRoute } from '../features/admin/guards/ProtectedRoute';

// Funcionários (cozinheiro / garçom / entregador)
import { CadastroFuncionarioPage } from '../features/funcionarios/pages/CadastroFuncionarioPage';
import { CozinhaPage } from '../features/funcionarios/pages/CozinhaPage';
import { BalcaoPage } from '../features/funcionarios/pages/BalcaoPage';
import { ReservasPage } from '../features/funcionarios/pages/ReservasPage';
import { RoleRoute } from '../features/funcionarios/guards/RoleRoute';
import { FuncionarioAutenticadoRoute } from '../features/funcionarios/guards/FuncionarioAutenticadoRoute';

/** @brief Router da aplicação (react-router), com todas as rotas da loja, totem, funcionários e admin. */
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
        // Área do usuário (cliente): cadastro/login, programa de
        // fidelidade, histórico de compras e reserva de mesa.
        { path: 'usuario', Component: UsuarioPage },
        {
          path: 'usuario/reservar',
          element: (
            <ClienteAutenticadoRoute>
              <ReservarMesaPage />
            </ClienteAutenticadoRoute>
          ),
        },
        {
          path: 'compras',
          element: (
            <ClienteAutenticadoRoute>
              <ComprasPage />
            </ClienteAutenticadoRoute>
          ),
        },
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
      // Login separado da customização da loja — não fica embaixo de
      // /admin de propósito. Por enquanto aceita qualquer funcionário
      // cadastrado (independente do cargo) e manda pra /customizacao.
      path: 'custom',
      Component: CustomLoginPage,
    },
    {
      // A customização também é uma rota de nível superior (fora do
      // /admin) — chega até aqui pelo login em /custom.
      path: 'customizacao',
      element: (
        <FuncionarioAutenticadoRoute>
          <CustomizationPage />
        </FuncionarioAutenticadoRoute>
      ),
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
        {
          // Painel de reservas de mesa feitas pelos clientes pelo site
          // (/usuario/reservar) — o garçom confirma ou cancela aqui.
          path: 'reservas',
          element: (
            <RoleRoute cargo="garcom">
              <ReservasPage />
            </RoleRoute>
          ),
        },
        {
          // Painel gerencial: relatórios de vendas em PDF com filtro por
          // dia/semana/mês/ano.
          path: 'gerente',
          element: (
            <RoleRoute cargo="gerente">
              <GerentePage />
            </RoleRoute>
          ),
        },

        // Páginas antigas (cardápio, pedidos): ainda usam o guard/login
        // antigos (ProtectedRoute + AuthContext). A customização saiu
        // daqui — agora é uma rota própria em /customizacao, com login
        // separado em /custom (veja acima).
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