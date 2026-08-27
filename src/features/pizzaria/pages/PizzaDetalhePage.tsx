import { useParams } from 'react-router';
import { usePizzaPorSlug } from '../hooks/usePizzas';
import { PizzaPersonalizacao } from '../components/PizzaPersonalizacao';
import { extras } from '../types/extras';

export function PizzaDetalhePage() {
  const { slug } = useParams();
  const {
    data: pizza,
    isLoading,
    isError,
  } = usePizzaPorSlug(slug);

  if (isLoading) {
    return <p>Carregando pizza...</p>;
  }

  if (isError || !pizza) {
    return <p>Pizza não encontrada.</p>;
  }

  return (
    <main className="pagina-pizza">
      <PizzaPersonalizacao
        pizza={pizza}
        extras={extras}
      />
    </main>
  );
}