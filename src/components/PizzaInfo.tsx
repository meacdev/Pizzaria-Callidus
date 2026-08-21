interface PizzariaInfoProps {
  nome: string;
  status: string;
  localizacao: string;
}

export function PizzariaInfo({
  nome,
  status,
  localizacao,
}: PizzariaInfoProps) {
  return (
    <section className="pizzaria-info">

      <div className="pizzaria-logo">
        <span>logo</span>
        <span>pizzaria</span>
      </div>

      <div className="pizzaria-dados">
        <h1>{nome}</h1>

        <p>
          STATUS {status} - {localizacao}
        </p>
      </div>

    </section>
  );
}