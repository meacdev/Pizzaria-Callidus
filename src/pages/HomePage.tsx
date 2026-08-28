import { useState } from 'react';
import { Link } from 'react-router';

import { Loading } from '../component/Loading';
import { MensagemErro } from '../component/MensagemErro';

import { ListaCombos } from '../features/pizzaria/components/ListaCombos';
import { ListaBebidas } from '../features/pizzaria/components/ListaBebidas';
import { CarrosselPizza } from '../features/pizzaria/components/CarrosselPizza';
import { EstabelecimentoInfo } from '../features/pizzaria/components/EstabelecimentoInfo';

import { usePizzas } from '../features/pizzaria/hooks/usePizzas';
import { useCombos } from '../features/pizzaria/hooks/useCombo';
import { useBebidas } from '../features/pizzaria/hooks/useBebidas';
import { useCustomizationStore } from '../context/customization.store';
import { estaAberto } from '../features/admin/utils/customization.utils';

import bannerPadrao from '../assets/banner.jpg';
import logoPadrao from '../assets/logo.png';

export function HomePage() {
  const customization = useCustomizationStore((state) => state.customization);
  const aberta = estaAberto(customization);
  const [mostrarInformacoes, setMostrarInformacoes] = useState(false);

  const logoSrc = customization.logoUrl || logoPadrao;
  const bannerSrc = customization.bannerUrl || bannerPadrao;

  const {
    data: pizzas = [],
    isLoading,
    isError,
  } = usePizzas();

  const {
    data: bebidas = [],
    isLoading: isLoadingBebidas,
    isError: isErrorBebidas,
  } = useBebidas();

  const {
    data: combos = [],
    isLoading: isLoadingCombos,
    isError: isErrorCombos,
  } = useCombos();

  if (
    isLoading ||
    isLoadingCombos ||
    isLoadingBebidas
  ) {
    return <Loading mensagem="Carregando..." />;
  }

  if (
    isError ||
    isErrorCombos ||
    isErrorBebidas
  ) {
    return (
      <MensagemErro
        mensagem="Não foi possível carregar a página inicial."
      />
    );
  }

  return (
    <>
      <section className="hero-pizzaria">
        <img className="hero-imagem" src={bannerSrc} alt="Banner da pizzaria" />
        <div className="hero-conteudo">
          <Link className="marca" to="/" aria-label={`${customization.nomePizzaria} - início`}>
            <span className="marca-icone"><img src={logoSrc} alt="Logo" /></span>
          </Link>
          <div className="hero-info">
            <h1>{customization.nomePizzaria}</h1>
            <div className="hero-info-status">
              <span className="tag">{aberta ? 'Aberto' : 'Fechado'}</span>
              <span className="separador">•</span>
              <span>📍 {customization.endereco || 'Manaus - AM'}</span>
              <span className="separador">•</span>
              <button type="button" className="link-informacoes" onClick={() => setMostrarInformacoes(true)}>
                Mais informações
              </button>
            </div>
          </div>
        </div>
      </section>
      <CarrosselPizza
        titulo="Destaques"
        pizzas={pizzas.slice(0, 6)}
        compacto
      />
      <ListaCombos
        titulo="Combos mais vendidos"
        combos={combos.slice(0, 6)}
        compacto
      />
      <ListaBebidas
        titulo="Bebidas"
        bebidas={bebidas.slice(0, 6)}
      />
      <EstabelecimentoInfo aberto={mostrarInformacoes} onFechar={() => setMostrarInformacoes(false)} logo={logoSrc} />
    </>
  );
}
