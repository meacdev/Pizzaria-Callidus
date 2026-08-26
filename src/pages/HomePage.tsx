import { Link } from 'react-router';
import { Loading } from '../component/Loading';
import { MensagemErro } from '../component/MensagemErro';
import { ListaCombos } from '../features/pizzaria/components/ListaCombos';
import { CarrosselPizza } from '../features/pizzaria/components/CarrosselPizza';
import { usePizzas } from '../features/pizzaria/hooks/usePizzas';
import { useCombos } from '../features/pizzaria/hooks/useCombo';
import banner from '../assets/banner.jpg';
import logo from '../assets/logo.png';

export function HomePage() {
  const { data: pizzas = [], isLoading, isError } = usePizzas();
  const { data: combos = [], isLoading: isLoadingCombos, isError: isErrorCombos } = useCombos();
  if (isLoading || isLoadingCombos) return <Loading mensagem="Carregando..." />;
  if (isError || isErrorCombos) return <MensagemErro mensagem="Não foi possível carregar a página inicial." />;

  return (
    <>
      <section className="hero-pizzaria">
        <img className="hero-imagem" src={banner} alt="Banner da pizzaria" />

        <div className="hero-conteudo">
          <Link className="marca" to="/" aria-label="Pizzaria React Moderna - início">
            <span className="marca-icone"><img src={logo} alt="Logo" /></span>
          </Link>
          <div className="hero-info">
            <h1>Paradiso Pizza</h1>
            <div className="hero-info-status">
              <span className="tag">Fechado</span>
              <p>   -   Manaus-AM</p>
            </div>
          </div>
        </div>
      </section>
      <CarrosselPizza titulo="Destaques" pizzas={pizzas.slice(0, 6)} compacto />
      <ListaCombos titulo="Combos" combos={combos.slice(0, 6)}  compacto />
    </>
  );
}
