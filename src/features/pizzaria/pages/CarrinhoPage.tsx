import { Link } from 'react-router';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { ItemCarrinho } from '../components/ItemCarrinho';

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);
}

export function CarrinhoPage() {

  const itensCarrinho = useCarrinhoStore(
    (state) => state.itens
  );

  const limparCarrinho =
    useCarrinhoStore(
      (state) => state.limparCarrinho,
    );

  const totalItens =
    itensCarrinho.reduce(
      (soma, item) =>
        soma + item.quantidade,
      0,
    );

  const totalPreco = itensCarrinho.reduce(
    (soma, item) =>
      soma +
      item.precoUnitario * item.quantidade,
    0,
  );

  return (
    <>
      <main className="principal cabecalho-pagina">

        <span className="tag">
          Sua coleção
        </span>

        <h1>
          Meu carrinho
        </h1>

        <p>
          Você possui {totalItens} item(ns)
          no carrinho.
        </p>

        <div className="acoes-pagina">

          <Link
            className="botao-secundario"
            to="/cardapio"
          >
            Explorar cardápio
          </Link>

          {itensCarrinho.length > 0 && (
            <button
              type="button"
              className="botao-perigo"
              onClick={limparCarrinho}
            >
              Limpar carrinho
            </button>
          )}

        </div>

      </main>

      <section className="principal secao-pizzas">

        <div className="titulo-secao">

          <h2>
            Itens no carrinho
          </h2>

          <span>
            {itensCarrinho.length} item(ns)
          </span>

        </div>

        {itensCarrinho.length === 0 ? (

          <p className="mensagem-vazia">
            Seu carrinho está vazio.
          </p>

        ) : (

          <>

            <div
              className="grade-pizzas"
              aria-label="Itens do carrinho"
            >

              {itensCarrinho.map((item) => (
                <ItemCarrinho
                  key={item.id}
                  item={item}
                />
              ))}

            </div>

            <div className="resumo-carrinho">

              <strong>
                Total: {formatarPreco(totalPreco)}
              </strong>

              <Link
                className="botao-primario"
                to="/checkout"
              >
                Finalizar pedido
              </Link>

            </div>

          </>

        )}

      </section>
    </>
  );
}