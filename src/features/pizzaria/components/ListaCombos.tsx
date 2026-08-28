import { ComboCard } from './ComboCard';
import type { Combo } from '../types/combo';

interface ListaCombosProps {
  readonly combos: readonly Combo[];
  readonly titulo: string;
  readonly compacto?: boolean;
  readonly mensagemVazia?: string;
}

export function ListaCombos({
  combos,
  titulo,
  compacto = false,
  mensagemVazia = 'Nenhum combo encontrado.',
}: ListaCombosProps) {
  return (
    <section className="principal secao-combos">
      <div className="titulo-secao">
        <h2>{titulo}</h2>
        <span>{combos.length} combo(s)</span>
      </div>
      {combos.length === 0 ? (
        <p className="mensagem-vazia">
          {mensagemVazia}
        </p>
      ) : (
        <div
          className="grade-combos"
          aria-label={titulo}
        >
          {combos.map((combo) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              compacto={compacto}
            />
          ))}
        </div>
      )}
    </section>
  );
}