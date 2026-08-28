import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Loading } from '../../../component/Loading';
import { MensagemErro } from '../../../component/MensagemErro';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useBebidaPorId } from '../hooks/useBebidas';

function formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(preco);
}

export function BebidaDetalhePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const adicionarAoCarrinho =
        useCarrinhoStore(
            (state) => state.adicionarAoCarrinho
        );
    const {
        data: bebida,
        isLoading,
        isError,
    } = useBebidaPorId(id);
    const [quantidade, setQuantidade] = useState(1);

    if (isLoading) {
        return (
            <Loading mensagem="Carregando bebida..." />
        );
    }

    if (isError || !bebida) {
        return (
            <MensagemErro
                mensagem="Não foi possível encontrar essa bebida."
            />
        );
    }

    const total = bebida.preco * quantidade;

    function aumentarQuantidade() {
        setQuantidade((atual) => atual + 1);
    }

    function diminuirQuantidade() {
        setQuantidade((atual) =>
            Math.max(1, atual - 1)
        );
    }

    function confirmarAdicao() {
        if (!bebida) return;

        adicionarAoCarrinho({
            id: `bebida-${bebida.id}`,
            tipo: 'bebida',
            bebida: bebida,
            quantidade,
            precoUnitario: bebida.preco,
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
                        src={bebida.imgURL}
                        alt={bebida.nome}
                    />
                </div>

                <div className="produto-confirmacao-info">

                    <span className="tag">
                        Bebida
                    </span>

                    <h1>
                        {bebida.nome}
                    </h1>

                    <p className="descricao-produto">
                        {bebida.descricao}
                    </p>

                    <strong className="preco-detalhe">
                        {formatarPreco(bebida.preco)}
                    </strong>

                    <div className="quantidade-produto">

                        <span>
                            Quantidade
                        </span>

                        <div className="controle-quantidade">

                            <button
                                type="button"
                                onClick={diminuirQuantidade}
                                aria-label="Diminuir quantidade"
                            >
                                −
                            </button>

                            <strong>
                                {quantidade}
                            </strong>

                            <button
                                type="button"
                                onClick={aumentarQuantidade}
                                aria-label="Aumentar quantidade"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <div className="confirmacao-rodape">

                        <strong>
                            Total: {formatarPreco(total)}
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