import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { usePedidoStore } from '../../../store/pedido.store';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { usePizzas } from '../hooks/usePizzas';
import { useBebidas } from '../hooks/useBebidas';
import { useCombos } from '../hooks/useCombo';
import { obterUltimoPedidoRepetivel, revalidarItensPedido } from '../utils/repetirPedido.utils';
import type { ItemCarrinho } from '../types/itemCarrinho';

function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
}

function nomeExibicaoItem(item: ItemCarrinho): string {
  if (item.tipo === 'pizza') return item.pizza.nome;
  if (item.tipo === 'bebida') return item.bebida.nome;
  return item.combo.nome;
}

export function RepetirUltimoPedido() {
  const navigate = useNavigate();
  const pedidos = usePedidoStore((state) => state.pedidos);
  const adicionarAoCarrinho = useCarrinhoStore((state) => state.adicionarAoCarrinho);

  const { data: pizzas = [] } = usePizzas();
  const { data: bebidas = [] } = useBebidas();
  const { data: combos = [] } = useCombos();

  const [enviando, setEnviando] = useState(false);
  const [itensIndisponiveis, setItensIndisponiveis] = useState<readonly string[]>([]);

  const ultimoPedido = useMemo(() => obterUltimoPedidoRepetivel(pedidos), [pedidos]);

  if (!ultimoPedido) return null;

  const totalItens = ultimoPedido.itensCarrinho.reduce((soma, item) => soma + item.quantidade, 0);

  function handleRepetirPedido() {
    if (!ultimoPedido) return;

    setEnviando(true);

    const { itensParaAdicionar, itensIndisponiveis: indisponiveis } = revalidarItensPedido(
      ultimoPedido.itensCarrinho,
      pizzas,
      bebidas,
      combos,
    );

    if (itensParaAdicionar.length === 0) {
      setItensIndisponiveis(indisponiveis);
      setEnviando(false);
      return;
    }

    itensParaAdicionar.forEach((item) => adicionarAoCarrinho(item));

    if (indisponiveis.length > 0) {
      setItensIndisponiveis(indisponiveis);
      setEnviando(false);
      return;
    }

    navigate('/carrinho');
  }

  return (
    <section className="repetir-pedido">
      <div className="repetir-pedido-conteudo">
        <span className="tag">Bem-vindo de volta</span>
        <h2>Repetir seu último pedido?</h2>

        <ul className="repetir-pedido-lista">
          {ultimoPedido.itensCarrinho.map((item) => (
            <li key={item.id}>
              {item.quantidade}x {nomeExibicaoItem(item)}
            </li>
          ))}
        </ul>

        <p className="repetir-pedido-total">
          {totalItens} {totalItens === 1 ? 'item' : 'itens'} · {formatarPreco(ultimoPedido.total)}
        </p>

        {itensIndisponiveis.length > 0 && (
          <p className="repetir-pedido-aviso" role="alert">
            {itensIndisponiveis.length === 1
              ? `${itensIndisponiveis[0]} não está mais disponível no cardápio.`
              : `${itensIndisponiveis.join(', ')} não estão mais disponíveis no cardápio.`}
            {' '}
            {itensIndisponiveis.length < ultimoPedido.itensCarrinho.length &&
              'Adicionamos os demais itens ao carrinho.'}
          </p>
        )}

        <button
          type="button"
          className="botao-primario"
          onClick={handleRepetirPedido}
          disabled={enviando}
        >
          {enviando ? 'Adicionando...' : 'Pedir de novo'}
        </button>
      </div>
    </section>
  );
}