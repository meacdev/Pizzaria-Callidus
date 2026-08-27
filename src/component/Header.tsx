import { NavLink } from 'react-router';
import { useCarrinhoStore } from '../store/carrinho.store';

export function Header() {
  const totalCarrinho = useCarrinhoStore((state) =>
    state.itens.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
  );
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
          to="/categoria"
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
    </header>
  );
}