import { Link } from 'react-router';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { ListaPizzas } from '../components/ListaPizzas';
import { usePizzas } from '../hooks/usePizzas';
import { obterPizzasCarrinho } from '../utils/pizza.utils';

export function CarrinhoPage() {
  const carrinho = useCarrinhoStore((state) => state.itens);
  const limparCarrinho = useCarrinhoStore((state) => state.limparCarrinho);
  const { data: pizzas = [], isLoading, isError } = usePizzas();
  if (isLoading) return <Loading mensagem="Carregando seus carrinho..." />;
  if (isError) return <MensagemErro mensagem="Não foi possível carregar seus carrinho." />;
  const pizzasCarrinho = obterPizzasCarrinho(pizzas, carrinho);
  
  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">Sua coleção</span>
        <h1>Meus carrinho</h1>
        <p>Você possui {pizzasCarrinho.length} pizza(s) no carrinho.</p>
        <div className="acoes-pagina">
          <Link className="botao-secundario" to="/cardapio">Explorar cardápio</Link>
          {pizzasCarrinho.length > 0 && <button type="button" className="botao-perigo" onClick={limparCarrinho}>Limpar carrinho</button>}
        </div>
      </main>
      <ListaPizzas titulo="Pizzas no carrinho" pizzas={pizzasCarrinho} compacto mensagemVazia="Você ainda não adicionou pizzas ao carrinho." />
    </>
  );
}
