import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useComboPorSlug } from '../hooks/useCombo';
import { nomeCategoriaCombo } from '../utils/combo.utils';

function formatarPreco(preco: string): string {
  const valor = Number(preco);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function ComboDetalhePage() {
  const { slug } =
    useParams<{ slug: string }>();
  const navigate = useNavigate();
  const adicionarAoCarrinho =
    useCarrinhoStore(
      (state) => state.adicionarAoCarrinho,
    );
  const {
    data: combo,
    isLoading,
    isError,
  } = useComboPorSlug(slug);
  const [quantidade, setQuantidade] =
    useState(1);
  if (isLoading) {
    return (
      <Loading mensagem="Carregando combo..." />
    );
  }
  if (isError || !combo) {
    return (
      <MensagemErro
        mensagem="Não foi possível encontrar esse combo."
      />
    );
  }

  const preco = Number(combo.precoBase);
  const total = preco * quantidade;

  function aumentarQuantidade() {
    setQuantidade((atual) => atual + 1);
  }

  function diminuirQuantidade() {
    setQuantidade((atual) =>
      Math.max(1, atual - 1),
    );
  }

  function confirmarAdicao() {
    if (!combo) return;
    adicionarAoCarrinho({
      id: `combo-${combo.id}`,
      tipo: 'combo',
      combo: combo,
      quantidade,
      precoUnitario: preco,
    });
    navigate('/cardapio');
  }

  return (
    <main className="principal">
      <Link
        className="voltar"
        to="/cardapio"
      >
        ← Voltar para o cardápio
      </Link>
      <section className="produto-confirmacao">
        <div className="produto-confirmacao-imagem">
          <img
            src="/imagens/pizzas/combo.jpg"
            alt={`Combo ${combo.nome}`}
          />
        </div>
        <div className="produto-confirmacao-info">
          <span className="tag">
            {nomeCategoriaCombo(
              combo.categoria,
            )}
          </span>
          <h1>
            {combo.nome}
          </h1>
          <p className="descricao-produto">
            {combo.descricao}
          </p>
          <div className="lista-itens-combo">
            <h2>
              Este combo inclui:
            </h2>
            <ul>
              {combo.itens.map((item) => (
                <li key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <strong className="preco-detalhe">
            {formatarPreco(combo.precoBase)}
          </strong>

          <div className="quantidade-produto">

            <span>
              Quantidade
            </span>

            <div className="controle-quantidade">

              <button
                type="button"
                onClick={diminuirQuantidade}
              >
                −
              </button>

              <strong>
                {quantidade}
              </strong>

              <button
                type="button"
                onClick={aumentarQuantidade}
              >
                +
              </button>

            </div>

          </div>

          <div className="confirmacao-rodape">

            <strong>
              Total: {formatarPreco(
                total.toFixed(2),
              )}
            </strong>

            <button
              type="button"
              className="botao-primario"
              onClick={confirmarAdicao}
            >
              Adicionar ao carrinho
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}