import { Link, NavLink } from 'react-router';
import { useCarrinhoStore } from '../store/carrinho.store';
import logo from '../assets/logo.png';

export function Header() {
  const totalCarrinho = useCarrinhoStore((state) =>
    Object.values(state.itens).reduce((soma, quantidade) => soma + quantidade, 0),
  );

  return (
    <header className="cabecalho">
      <Link className="marca" to="/" aria-label="Pizzaria React Moderna - início">
        <span className="marca-icone"><img src={logo} alt="Logo" /></span>
      </Link>

      <nav className="navegacao" aria-label="Navegação principal">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'ativo' : ''}>Início</NavLink>
        <NavLink to="/cardapio" className={({ isActive }) => isActive ? 'ativo' : ''}>Cardápio</NavLink>
        <NavLink to="/categoria" className={({ isActive }) => isActive ? 'ativo' : ''}>Compras</NavLink>
        <NavLink to="/carrinho" className={({ isActive }) => isActive ? 'ativo' : ''}>
          Carrinho
          {totalCarrinho > 0 && <span className="badge">{totalCarrinho}</span>}
        </NavLink>
      </nav>
      <div></div>
    </header>
  );
}
