/**
 * @file PizzaDetalhePage.tsx
 * @brief Página de detalhe/personalização de uma pizza específica (rota por slug).
 *
 * @details
 * Busca a pizza pelo slug da URL (@see usePizzaPorSlug) e delega a
 * montagem/personalização (tamanho, extras, borda) para @see
 * PizzaPersonalizacao, passando a lista fixa de extras disponíveis
 * (@see extras em types/extras.ts).
 */
import { useParams } from 'react-router';
import { usePizzaPorSlug } from '../hooks/usePizzas';
import { PizzaPersonalizacao } from '../components/PizzaPersonalizacao';
import { extras } from '../types/extras';

/** @brief Página de detalhe da pizza (rota /cardapio/pizza/:slug), com carregamento e tratamento de erro/não encontrado. */
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