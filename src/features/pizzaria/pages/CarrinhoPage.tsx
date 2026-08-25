import { useMemo, useState } from 'react';
import { CampoBusca } from '../../../component/CampoBusca';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { ListaPizzas } from '../components/ListaPizzas';
import { usePizzas } from '../hooks/usePizzas';
import { filtrarPizzasPorTermo} from '../utils/pizza.utils';

export function CardapioPage() {
  const [termoBusca, setTermoBusca] = useState('');
  const { data: pizzas = [], isLoading, isError } = usePizzas();
  const pizzasFiltradas = useMemo(() => filtrarPizzasPorTermo(pizzas, termoBusca), [pizzas, termoBusca]);

  if (isLoading) return <Loading mensagem="Carregando cardápio completo..." />;
  if (isError) return <MensagemErro mensagem="Não foi possível carregar o cardápio." />;

  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">Cardápio</span>
        <h1>Todas as pizzas</h1>
        <CampoBusca valor={termoBusca} rotulo="Buscar no cardápio" placeholder="Ex.: Calabresa, Tradicional..." onChange={setTermoBusca} />
        <p className="resumo-busca">{pizzasFiltradas.length} de {pizzas.length} pizza(s) encontrado(s).</p>
      </main>
      <ListaPizzas titulo="Resultado da busca" pizzas={pizzasFiltradas} compacto mensagemVazia="Nenhuma pizza corresponde à busca realizada." />
    </>
  );
}
