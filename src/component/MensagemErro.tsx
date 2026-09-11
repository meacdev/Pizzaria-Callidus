/**
 * @file MensagemErro.tsx
 * @brief Estado de erro genérico, exibido quando uma operação/busca falha.
 */

/** @brief Props do componente @see MensagemErro. */
interface MensagemErroProps {
  readonly titulo?: string;
  readonly mensagem: string;
}

/** @brief Tela de erro com título e mensagem, anunciada via `role="alert"`. */
export function MensagemErro({
  titulo = 'Ops! Algo deu errado.',
  mensagem
}: MensagemErroProps) {
  return (
    <main className="principal">
      <section className="estado estado-erro" role="alert">
        <h2>{titulo}</h2>
        <p>{mensagem}</p>
      </section>
    </main>
  );
}