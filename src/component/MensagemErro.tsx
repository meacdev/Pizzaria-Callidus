interface MensagemErroProps {
  readonly titulo?: string;
  readonly mensagem: string;
}

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