import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="principal">
      <section className="estado">
        <h2>Página não encontrada</h2>
        <p>A página solicitada não existe ou foi movida.</p>
        <Link className="botao-primario" to="/">
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}