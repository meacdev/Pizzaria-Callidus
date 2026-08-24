import { Link } from 'react-router';
import { Loading } from '../component/Loading';
import { MensagemErro } from '../component/MensagemErro';
import { ListaPizzas } from '../features/pizzaria/components/ListaPizzas';
import { usePizzas } from '../features/pizzaria/hooks/usePizzas';
import banner from '../assets/banner.jpg';

export function HomePage() {
  const { data: pizzas = [], isLoading, isError } = usePizzas();
  if (isLoading) return <Loading mensagem="Carregando..." />;
  if (isError) return <MensagemErro mensagem="Não foi possível carregar a página inicial." />;

  return (
    <>
      <section className="hero-pizzaria">
        <img className="hero-imagem" src={banner} alt="Banner da pizzaria" />
        {/* <div className="hero-conteudo">
          {/* <span className="tag">O sabor que combina com você</span>
          <h1>Encontre a pizza perfeita para o seu momento.</h1>
          <p>Explore nosso cardápio de pizzas, escolha seus sabores carrinhos e faça seu pedido.</p>
          <div className="hero-acoes">
            <Link className="botao-primario" to="/cardapio">Explorar cardápio</Link>
            <Link className="botao-secundario" to="/carrinho">Meu carrinho</Link>
          </div>
        </div> */}
      </section>
      <ListaPizzas titulo="Destaques" pizzas={pizzas.slice(0, 6)} compacto />
    </>
  );
}
