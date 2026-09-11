import { NavLink } from 'react-router';
import { useCarrinhoStore } from '../store/carrinho.store';
import { useClienteAuth } from '../features/clientes/context/ClienteAuthContext';

export function Header() {
  const totalCarrinho = useCarrinhoStore((state) =>
    state.itens.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
  );
  const { cliente, autenticado } = useClienteAuth();

  return (
    <header className="cabecalho">
      <nav
        className="navegacao"
        aria-label="Navegação principal"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'ativo' : ''
          }
        >
          Início
        </NavLink>
        <NavLink
          to="/cardapio"
          className={({ isActive }) =>
            isActive ? 'ativo' : ''
          }
        >
          Cardápio
        </NavLink>
        <NavLink
          to="/compras"
          className={({ isActive }) =>
            isActive ? 'ativo' : ''
          }
        >
          Compras
        </NavLink>
        <NavLink
          to="/carrinho"
          className={({ isActive }) =>
            isActive ? 'ativo' : ''
          }
        >
          <span className="link-carrinho">
            Carrinho
            {totalCarrinho > 0 && (
              <span className="badge">
                {totalCarrinho}
              </span>
            )}
          </span>
        </NavLink>
      </nav>

      <NavLink
        to="/usuario"
        className={({ isActive }) =>
          `link-area-usuario${isActive ? ' ativo' : ''}`
        }
      >
        {autenticado ? `Olá, ${cliente?.nome.split(' ')[0]}` : 'Área do usuário'}
      </NavLink>
    </header>
  );
}