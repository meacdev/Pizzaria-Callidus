/**
 * @file Layout.tsx
 * @brief Layout raiz das páginas da loja: cabeçalho + conteúdo da rota + rodapé.
 *
 * @details
 * Usado como `Component` da rota "/" em @see router.tsx; o conteúdo de
 * cada página é renderizado em `<Outlet />`, entre @see Header e @see Footer.
 */
import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

/** @brief Estrutura comum das páginas da loja (cabeçalho, conteúdo da rota e rodapé). */
export function Layout() {
  return (
    <div className="aplicacao">
      <Header />
      <div className="conteudo">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
