interface LoadingProps {
  readonly mensagem?: string;
}

export function Loading({ mensagem = 'Carregando...' }: LoadingProps) {
  return (
    <main className="principal">
      <section className="estado estado-carregando" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>{mensagem}</p>
      </section>
    </main>
  );
}