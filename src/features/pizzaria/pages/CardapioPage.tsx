import { useMemo, useState } from 'react';
import { CampoBusca } from '../../../component/CampoBusca';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { filtrarPizzasPorTermo } from '../utils/pizza.utils';
import { ListaPizzas } from '../components/ListaPizzas';
import { usePizzas } from '../hooks/usePizzas';
import { ListaBebidas } from '../components/ListaBebidas';
import { useBebidas } from '../hooks/useBebidas';
import { ListaCombos } from '../components/ListaCombos';
import { useCombos } from '../hooks/useCombo';

export function CardapioPage() {
  const [termoBusca, setTermoBusca] = useState('');
  const { data: pizzas = [], isLoading, isError } = usePizzas();
  const { data: bebidas = [], isLoading: isLoadingBebidas, isError: isErrorBebidas } = useBebidas();
  const { data: combos = [], isLoading: isLoadingCombos, isError: isErrorCombos } = useCombos();
  const pizzasFiltradas = useMemo(() => filtrarPizzasPorTermo(pizzas, termoBusca), [pizzas, termoBusca]);
  if (isLoading || isLoadingCombos || isLoadingBebidas) return <Loading mensagem="Carregando..." />;
  if (isError || isErrorCombos || isErrorBebidas) return <MensagemErro mensagem="Não foi possível carregar a página inicial." />;
  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">Cardápio</span>
        <h1>Todas as pizzas</h1>
        <CampoBusca valor={termoBusca} rotulo="Buscar no cardápio" placeholder="Ex.: Calabresa, Tradicional..." onChange={setTermoBusca} />
        <p className="resumo-busca">{pizzasFiltradas.length} de {pizzas.length} pizza(s) encontrado(s).</p>
      </main>
      <ListaPizzas titulo="Resultado da busca" pizzas={pizzasFiltradas} compacto mensagemVazia="Nenhuma pizza corresponde à busca realizada." />
      <ListaCombos titulo="Combos" combos={combos}  compacto />
      <ListaBebidas bebidas={bebidas}
      />
    </>
  );
}
