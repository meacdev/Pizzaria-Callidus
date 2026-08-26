import { useEffect } from 'react';
import { Link } from 'react-router';
import { Loading } from '../component/Loading';
import { MensagemErro } from '../component/MensagemErro';
import { ListaPizzas } from '../features/pizzaria/components/ListaPizzas';
import { usePizzas } from '../features/pizzaria/hooks/usePizzas';
import { useCustomizationStore } from '../context/customization.store';
import banner from '../assets/banner.jpg';

export function HomePage() {
  const { data: pizzas = [], isLoading, isError } = usePizzas();
  const customization = useCustomizationStore((state) => state.customization);

  // Injeta as cores da pizzaria como CSS variables para todo o site usar
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--pizza-cor-primaria', customization.corPrimaria);
    root.style.setProperty('--pizza-cor-secundaria', customization.corSecundaria);
  }, [customization.corPrimaria, customization.corSecundaria]);

  if (isLoading) return <Loading mensagem="Carregando..." />;
  if (isError) return <MensagemErro mensagem="Não foi possível carregar a página inicial." />;

  return (
    <>
      <section className="hero-pizzaria">
        <img 
          className="hero-imagem" 
          src={customization.logoUrl || banner} 
          alt={customization.nomePizzaria} 
        />
        <div className="hero-conteudo">
          <span className="tag" style={{ backgroundColor: customization.corPrimaria }}>
            {customization.nomePizzaria}
          </span>
          <h1>Encontre a pizza perfeita para o seu momento.</h1>
          <p>Explore nosso cardápio de pizzas, escolha seus sabores favoritos e faça seu pedido.</p>
          <div className="hero-acoes">
            <Link 
              className="botao-primario" 
              to="/cardapio"
              style={{ backgroundColor: customization.corPrimaria }}
            >
              Explorar cardápio
            </Link>
            <Link className="botao-secundario" to="/carrinho">Meu carrinho</Link>
          </div>
        </div>
      </section>
      <ListaPizzas titulo="Destaques" pizzas={pizzas.slice(0, 6)} compacto />
    </>
  );
}