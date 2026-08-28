import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type {
    Pizza,
    TamanhosDisponiveis,
} from '../types/pizza';
import type { Extra } from '../types/extras';
import { useCarrinhoStore } from '../../../store/carrinho.store';

interface PizzaPersonalizacaoProps {
    readonly pizza: Pizza;
    readonly extras: readonly Extra[];
}

const ADICIONAL_TAMANHO: Record<
    TamanhosDisponiveis,
    number
> = {
    P: 0,
    M: 5,
    G: 10,
    F: 15,
};

const ADICIONAL_BORDA: Record<
    string,
    number
> = {
    catupiry: 7,
    cheddar: 7,
};

const TAMANHOS_PADRAO: readonly TamanhosDisponiveis[] =
    ['P', 'M', 'G'];

export function PizzaPersonalizacao({
    pizza,
    extras,
}: PizzaPersonalizacaoProps) {
    const navigate = useNavigate();

    const adicionarAoCarrinho =
        useCarrinhoStore(
            (state) =>
                state.adicionarAoCarrinho,
        );
    const tamanhosDisponiveis =
        pizza.tamanhosDisponiveis?.length > 0
            ? pizza.tamanhosDisponiveis
            : TAMANHOS_PADRAO;

    const ingredientes =
        pizza.ingredientes ?? [];

    const [
        ingredientesRemovidos,
        setIngredientesRemovidos,
    ] = useState<readonly string[]>([]);

    const [
        extrasSelecionados,
        setExtrasSelecionados,
    ] = useState<readonly string[]>([]);

    const [
        tamanhoSelecionado,
        setTamanhoSelecionado,
    ] = useState<TamanhosDisponiveis>(
        tamanhosDisponiveis[0] ?? 'P',
    );

    const [
        bordaSelecionada,
        setBordaSelecionada,
    ] = useState<string | null>(
        null,
    );

    function alternarIngrediente(
        id: string,
    ) {
        setIngredientesRemovidos(
            (estadoAtual) => {
                if (
                    estadoAtual.includes(id)
                ) {
                    return estadoAtual.filter(
                        (ingredienteId) =>
                            ingredienteId !== id,
                    );
                }

                return [
                    ...estadoAtual,
                    id,
                ];
            },
        );
    }

    function alternarExtra(
        id: string,
    ) {
        setExtrasSelecionados(
            (estadoAtual) => {
                if (
                    estadoAtual.includes(id)
                ) {
                    return estadoAtual.filter(
                        (extraId) =>
                            extraId !== id,
                    );
                }

                return [
                    ...estadoAtual,
                    id,
                ];
            },
        );
    }

    const precoExtras =
        useMemo(() => {
            return extras
                .filter((extra) =>
                    extrasSelecionados.includes(
                        extra.id,
                    ),
                )
                .reduce(
                    (total, extra) =>
                        total +
                        Number(extra.preco),
                    0,
                );
        }, [
            extras,
            extrasSelecionados,
        ]);

    const precoTamanho =
        ADICIONAL_TAMANHO[
        tamanhoSelecionado
        ] ?? 0;

    const precoBorda =
        bordaSelecionada
            ? ADICIONAL_BORDA[
            bordaSelecionada
            ] ?? 0
            : 0;

    const precoFinal =
        Number(pizza.precoBase) +
        precoTamanho +
        precoExtras +
        precoBorda;

    function handleAdicionarAoCarrinho() {
        adicionarAoCarrinho({
            id: crypto.randomUUID(),
            tipo: 'pizza',
            pizza,
            quantidade: 1,
            tamanho:
                tamanhoSelecionado,
            ingredientesRemovidos,
            extras:
                extrasSelecionados,
            borda:
                bordaSelecionada,
            precoUnitario:
                precoFinal,
        });

        navigate('/cardapio');
    }

    return (
        <section className="personalizacao">
            <div className="personalizacao-imagem">
                <img
                    src={
                        pizza.imgURL ||
                        '/imagens/pizzas/pizzaSalgada.jpg'
                    }
                    alt={pizza.nome}
                    onError={(evento) => {
                        evento.currentTarget.src =
                            '/imagens/pizzas/pizzaSalgada.jpg';
                    }}
                />
            </div>

            <div className="personalizacao-conteudo">
                <div>
                    <h1>
                        {pizza.nome}
                    </h1>

                    <p className="personalizacao-descricao">
                        {pizza.descricao}
                    </p>
                </div>

                {/* TAMANHO */}
                <div className="grupo-opcao">
                    <h3>
                        Tamanho
                    </h3>

                    <div className="opcoes">
                        {tamanhosDisponiveis.map(
                            (tamanho) => {
                                const adicional =
                                    ADICIONAL_TAMANHO[
                                    tamanho
                                    ] ?? 0;

                                const selecionado =
                                    tamanhoSelecionado ===
                                    tamanho;

                                return (
                                    <button
                                        key={tamanho}
                                        type="button"
                                        className={
                                            selecionado
                                                ? 'opcao selecionada'
                                                : 'opcao'
                                        }
                                        onClick={() =>
                                            setTamanhoSelecionado(
                                                tamanho,
                                            )
                                        }
                                    >
                                        <span>
                                            {tamanho}
                                        </span>

                                        {adicional > 0 && (
                                            <small>
                                                {' '}
                                                + R${' '}
                                                {adicional
                                                    .toFixed(2)
                                                    .replace(
                                                        '.',
                                                        ',',
                                                    )}
                                            </small>
                                        )}
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                {/* INGREDIENTES */}
                <div className="grupo-opcao">
                    <h3>
                        Ingredientes
                    </h3>

                    <p>
                        Clique em um
                        ingrediente para
                        removê-lo.
                    </p>

                    <div className="lista-ingredientes">
                        {ingredientes.length >
                            0 ? (
                            ingredientes.map(
                                (ingrediente) => {
                                    const removido =
                                        ingredientesRemovidos.includes(
                                            ingrediente.id,
                                        );

                                    return (
                                        <button
                                            key={
                                                ingrediente.id
                                            }
                                            type="button"
                                            className={
                                                removido
                                                    ? 'ingrediente removido'
                                                    : 'ingrediente'
                                            }
                                            onClick={() =>
                                                alternarIngrediente(
                                                    ingrediente.id,
                                                )
                                            }
                                        >
                                            {removido
                                                ? '＋'
                                                : '✓'}

                                            {ingrediente.nome}
                                        </button>
                                    );
                                },
                            )
                        ) : (
                            <p>
                                Nenhum ingrediente
                                cadastrado.
                            </p>
                        )}
                    </div>
                </div>

                {/* ADICIONAIS */}
                <div className="grupo-opcao">
                    <h3>
                        Adicionais
                    </h3>

                    <div className="lista-extras">
                        {extras.map(
                            (extra) => {
                                const selecionado =
                                    extrasSelecionados.includes(
                                        extra.id,
                                    );

                                return (
                                    <button
                                        key={extra.id}
                                        type="button"
                                        className={
                                            selecionado
                                                ? 'extra selecionado'
                                                : 'extra'
                                        }
                                        onClick={() =>
                                            alternarExtra(
                                                extra.id,
                                            )
                                        }
                                    >
                                        <span>
                                            {selecionado
                                                ? '✓'
                                                : '+'}
                                        </span>

                                        <span>
                                            {extra.nome}
                                        </span>

                                        <strong>
                                            + R${' '}
                                            {Number(
                                                extra.preco,
                                            )
                                                .toFixed(2)
                                                .replace(
                                                    '.',
                                                    ',',
                                                )}
                                        </strong>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                {/* BORDA */}
                {pizza.permiteBorda && (
                    <div className="grupo-opcao">
                        <h3>
                            Borda
                        </h3>

                        <div className="opcoes">
                            <button
                                type="button"
                                className={
                                    bordaSelecionada ===
                                        null
                                        ? 'opcao selecionada'
                                        : 'opcao'
                                }
                                onClick={() =>
                                    setBordaSelecionada(
                                        null,
                                    )
                                }
                            >
                                Sem borda
                            </button>

                            <button
                                type="button"
                                className={
                                    bordaSelecionada ===
                                        'catupiry'
                                        ? 'opcao selecionada'
                                        : 'opcao'
                                }
                                onClick={() =>
                                    setBordaSelecionada(
                                        'catupiry',
                                    )
                                }
                            >
                                Catupiry + R$ 7,00
                            </button>

                            <button
                                type="button"
                                className={
                                    bordaSelecionada ===
                                        'cheddar'
                                        ? 'opcao selecionada'
                                        : 'opcao'
                                }
                                onClick={() =>
                                    setBordaSelecionada(
                                        'cheddar',
                                    )
                                }
                            >
                                Cheddar + R$ 7,00
                            </button>
                        </div>
                    </div>
                )}

                {/* RESUMO */}
                <div className="resumo">
                    <span>
                        Total
                    </span>

                    <strong>
                        R${' '}
                        {precoFinal
                            .toFixed(2)
                            .replace(
                                '.',
                                ',',
                            )}
                    </strong>
                </div>

                <button
                    type="button"
                    className="botao-adicionar"
                    onClick={
                        handleAdicionarAoCarrinho
                    }
                >
                    Adicionar ao carrinho
                </button>
            </div>
        </section>
    );
}