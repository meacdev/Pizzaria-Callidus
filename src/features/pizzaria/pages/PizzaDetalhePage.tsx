import { Link, useParams } from 'react-router';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { usePizzaPorSlug } from '../hooks/usePizzas';
import { nomeCategoria } from '../utils/pizza.utils';

function formatarPreco(preco: string): string {
  const valor = Number(preco);
  if (Number.isNaN(valor)) return `R$ ${preco}`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function PizzaDetalhePage() {
  const { slug } = useParams();
  const { data: pizza, isLoading, isError } = usePizzaPorSlug(slug);
  const alternarCarrinho = useCarrinhoStore((state) => state.alternarCarrinho);
  const estaNosCarrinho = useCarrinhoStore((state) => pizza ? state.estaNosCarrinho(pizza.id) : false);

  if (isLoading) return <Loading mensagem="Carregando detalhes da pizza..." />;
  if (isError) return <MensagemErro mensagem="Não foi possível carregar os detalhes da pizza." />;
  if (!pizza) return <MensagemErro titulo="Pizza não encontrada" mensagem="A pizza solicitada não existe no cardápio." />;

  return (
    <main className="principal">
      <Link className="voltar" to="/cardapio">← Voltar para o cardápio</Link>
      <article className="pizza-detalhe">

                        {/* Imagem da pizza*/}

        <div className="imagem-detalhe"><img src={`/imagens/pizzas/pizzaSalgada.jpg`} alt={`Imagem da pizza ${pizza.nome}`} /></div>
        <div className="pizza-info">
          <span className="tag">{nomeCategoria(pizza.categoria)}</span>
          <h1>{pizza.nome + ' ' + pizza.categoria}</h1>
          <p className="preco-base"> <strong>{pizza.precoBase}</strong></p>
          <ul className="metadados">
            <li><span>Borda permitida</span><strong>{pizza.permiteBorda}</strong></li>
          </ul>
          <div className="preco-detalhe">{formatarPreco(pizza.precoBase)}</div>
          <button type="button" className="botao-primario botao-detalhe" onClick={() => alternarCarrinho(pizza.id)} aria-pressed={estaNosCarrinho}>
            {estaNosCarrinho ? '★ Remover dos carrinho' : '☆ Adicionar aos carrinho'}
          </button>
        </div>
      </article>
      <section className="descricao-pizza">
        <h2>Sobre esta pizza</h2>
        <p>{pizza.descricao}</p>
      </section>
    </main>
  );
}
