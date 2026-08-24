import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

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
