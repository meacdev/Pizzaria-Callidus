/**
 * @file Header.tsx
 * @brief Cabeçalho fixo da loja (rotas dentro do Layout — @see Layout.tsx).
 *
 * @details
 * Mostra a navegação principal (fixa em português), o contador do
 * carrinho, o seletor de idioma da área do cliente (@see
 * LanguageSwitcher) e o botão de "Área do usuário" — que leva a
 * /usuario e mostra o nome do cliente logado quando há uma sessão
 * ativa (@see ClienteAuthContext). O rótulo desse botão é o único texto
 * deste arquivo traduzido pelo multi-idioma (@see LocaleContext), já
 * que ele é a porta de entrada da área do cliente.
 */
import { NavLink } from 'react-router';
import { useCarrinhoStore } from '../store/carrinho.store';
import { useClienteAuth } from '../features/clientes/context/ClienteAuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { LanguageSwitcher } from './LanguageSwitcher';

/** @brief Cabeçalho com navegação da loja, seletor de idioma e acesso à área do usuário. */
export function Header() {
  const totalCarrinho = useCarrinhoStore((state) =>
    state.itens.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
  );
  const { cliente, autenticado } = useClienteAuth();
  const { t } = useLocale();

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
          to="/cupons"
          className={({ isActive }) =>
            isActive ? 'ativo' : ''
          }
        >
          Cupons
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

      <div className="cabecalho-acoes">
        <LanguageSwitcher />

        <NavLink
          to="/usuario"
          className={({ isActive }) =>
            `link-area-usuario${isActive ? ' ativo' : ''}`
          }
        >
          {autenticado ? t('header.ola', { nome: cliente?.nome.split(' ')[0] ?? '' }) : t('header.areaUsuario')}
        </NavLink>
      </div>
    </header>
  );
}
