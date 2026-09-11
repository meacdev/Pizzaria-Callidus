/**
 * @file Loading.tsx
 * @brief Estado de carregamento genérico, exibido enquanto dados assíncronos são buscados.
 */

/** @brief Props do componente @see Loading. */
interface LoadingProps {
  readonly mensagem?: string;
}

/** @brief Tela de carregamento com spinner e mensagem, anunciada via `aria-live`. */
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