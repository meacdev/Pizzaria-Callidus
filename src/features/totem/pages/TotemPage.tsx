import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { usePizzas } from '../../pizzaria/hooks/usePizzas';
import { useBebidas } from '../../pizzaria/hooks/useBebidas';
import { useCombos } from '../../pizzaria/hooks/useCombo';
import { useSeletorItens, type ItemSelecionavel } from '../../pizzaria/hooks/useSeletorItens';
import { NUMEROS_DAS_MESAS } from '../../pizzaria/constants/mesas';
import { FORMAS_PAGAMENTO, OPCOES_GORJETA, type FormaPagamento } from '../../pizzaria/types/checkout';
import {
  DADOS_CARTAO_INICIAIS,
  type DadosCartao,
  type ErrosCartao,
} from '../../pizzaria/types/pagamento';
import {
  gerarCodigoPixCopiaCola,
  gerarUrlQrCodePix,
  mascararCvv,
  mascararNumeroCartao,
  mascararValidadeCartao,
  montarInfoPagamentoSimulado,
  simularProcessamentoPagamento,
  validarDadosCartao,
} from '../../pizzaria/utils/pagamento.utils';
import { enviarPedidoLocal } from '../../pizzaria/utils/pedidoLocal.utils';
import type { PedidoApi } from '../../pizzaria/api/pedido.service';

type Etapa = 'boasVindas' | 'cardapio' | 'carrinho' | 'entrega' | 'pagamento' | 'processando' | 'sucesso';
type CategoriaCardapio = 'pizza' | 'bebida' | 'combo';
type ModoConsumo = 'mesa' | 'balcao' | '';

const SEGUNDOS_PARA_REINICIAR = 25;

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

const Tela = styled.div`
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 20% 0%, rgba(255, 42, 42, 0.12), transparent 40%), #150a08;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: inherit;
`;

const TopoTotem = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);

  a {
    color: #d7c9c4;
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.5rem 0.9rem;
    border-radius: 10px;
  }

  a:hover {
    border-color: #ff5c5c;
    color: #ff5c5c;
  }
`;

const MarcaTotem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 900;
  letter-spacing: -0.02em;

  span.icone {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ff2a2a 0%, #8f1111 100%);
    display: grid;
    place-items: center;
    font-size: 1.3rem;
  }

  span.texto {
    font-size: 1.15rem;
  }
`;

const Corpo = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: 720px) {
    padding: 1.25rem;
  }
`;

const BoasVindasWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.75rem;

  h1 {
    font-size: clamp(2.2rem, 6vw, 3.6rem);
    margin: 0;
    letter-spacing: -0.03em;
  }

  p {
    color: #d7c9c4;
    font-size: 1.15rem;
    max-width: 520px;
    margin: 0;
  }
`;

const BotaoGigante = styled.button`
  border: none;
  border-radius: 999px;
  padding: 1.5rem 4rem;
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #ff2a2a 0%, #b31414 100%);
  cursor: pointer;
  box-shadow: 0 20px 45px rgba(255, 42, 42, 0.35);
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-3px) scale(1.02);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const Abas = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const Aba = styled.button<{ $ativa: boolean }>`
  padding: 0.8rem 1.4rem;
  border-radius: 999px;
  border: 1.5px solid ${({ $ativa }) => ($ativa ? '#ff2a2a' : 'rgba(255,255,255,0.15)')};
  background: ${({ $ativa }) => ($ativa ? 'rgba(255,42,42,0.18)' : 'transparent')};
  color: ${({ $ativa }) => ($ativa ? '#ff8080' : '#d7c9c4')};
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
`;

const GradeItens = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  padding-bottom: 7rem;
`;

const CartaoItem = styled.article`
  background: #241310;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const NomeItem = styled.h3`
  margin: 0;
  font-size: 1.05rem;
`;

const DescricaoItem = styled.p`
  margin: 0;
  color: #b9a9a3;
  font-size: 0.82rem;
  line-height: 1.4;
  flex: 1;
  min-height: 2.2rem;
`;

const LinhaPrecoAcao = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Preco = styled.span`
  font-weight: 900;
  font-size: 1.05rem;
`;

const ControleQuantidade = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 999px;
  padding: 0.25rem;

  button {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: #ff2a2a;
    color: #fff;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    line-height: 1;
  }

  span {
    min-width: 1.4rem;
    text-align: center;
    font-weight: 800;
  }
`;

const BotaoAdicionar = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  background: #ff2a2a;
  color: #fff;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #ff5c5c;
  }
`;

const BarraCarrinho = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a0d0a;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  z-index: 10;

  @media (max-width: 720px) {
    padding: 1rem;
  }
`;

const ResumoCarrinhoMini = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 1.1rem;
  }

  span {
    color: #d7c9c4;
    font-size: 0.82rem;
  }
`;

const ListaCarrinho = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
`;

const LinhaCarrinho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #241310;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.9rem 1.1rem;

  div.info {
    display: flex;
    flex-direction: column;
  }

  div.info strong {
    font-size: 1rem;
  }

  div.info span {
    color: #b9a9a3;
    font-size: 0.8rem;
  }
`;

const Cabecalho = styled.div`
  margin-bottom: 1.5rem;

  h2 {
    margin: 0 0 0.35rem;
    font-size: 1.6rem;
  }

  p {
    margin: 0;
    color: #d7c9c4;
  }
`;

const Rodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 1.5rem;
`;

const BotaoSecundario = styled.button`
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #ff5c5c;
    color: #ff5c5c;
  }
`;

const BotaoPrimario = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.9rem 2rem;
  font-weight: 900;
  font-size: 1.05rem;
  color: #fff;
  background: linear-gradient(135deg, #ff2a2a 0%, #b31414 100%);
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Formulario = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 560px;
`;

const Campo = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;

  input,
  select {
    padding: 0.9rem 1rem;
    border-radius: 12px;
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    background: #1e100c;
    color: #fff;
    font-size: 1rem;
  }
`;

const OpcoesModo = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const OpcaoModo = styled.button<{ $selecionada: boolean }>`
  flex: 1;
  min-width: 200px;
  padding: 1.1rem;
  border-radius: 14px;
  border: 1.5px solid ${({ $selecionada }) => ($selecionada ? '#ff2a2a' : 'rgba(255,255,255,0.16)')};
  background: ${({ $selecionada }) => ($selecionada ? 'rgba(255,42,42,0.16)' : '#1e100c')};
  color: #fff;
  text-align: left;
  cursor: pointer;

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  span {
    color: #d7c9c4;
    font-size: 0.82rem;
  }
`;

const OpcoesGorjeta = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const OpcaoGorjeta = styled.button<{ $selecionada: boolean }>`
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  border: 1.5px solid ${({ $selecionada }) => ($selecionada ? '#ff2a2a' : 'rgba(255,255,255,0.16)')};
  background: ${({ $selecionada }) => ($selecionada ? 'rgba(255,42,42,0.16)' : 'transparent')};
  color: #fff;
  font-weight: 800;
  cursor: pointer;
`;

const OpcoesPagamento = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const OpcaoPagamento = styled.button<{ $selecionada: boolean }>`
  flex: 1;
  min-width: 160px;
  padding: 1.1rem;
  border-radius: 14px;
  border: 1.5px solid ${({ $selecionada }) => ($selecionada ? '#ff2a2a' : 'rgba(255,255,255,0.16)')};
  background: ${({ $selecionada }) => ($selecionada ? 'rgba(255,42,42,0.16)' : '#1e100c')};
  color: #fff;
  text-align: left;
  cursor: pointer;

  strong {
    display: block;
  }

  span {
    color: #d7c9c4;
    font-size: 0.8rem;
  }
`;

const CartaoPix = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;

  code {
    background: #1e100c;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0.75rem;
    font-size: 0.7rem;
    word-break: break-all;
    max-width: 420px;
  }
`;

const ErroTexto = styled.p`
  color: #ffb0b0;
  background: rgba(230, 0, 0, 0.1);
  border: 1px solid rgba(230, 0, 0, 0.3);
  border-radius: 10px;
  padding: 0.75rem 1rem;
`;

const SucessoWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.25rem;

  .icone {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(42, 200, 110, 0.15);
    border: 2px solid #8df0b5;
    color: #8df0b5;
    display: grid;
    place-items: center;
    font-size: 2.5rem;
  }

  h2 {
    margin: 0;
    font-size: 2rem;
  }

  p {
    margin: 0;
    color: #d7c9c4;
  }

  .numero {
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: 0.05em;
  }
`;

interface CardapioListaProps {
  readonly vazio: string;
  readonly itens: readonly ItemSelecionavel[];
  readonly descricoes: Record<string, string>;
  readonly quantidades: Record<string, number>;
  readonly onAdicionar: (item: ItemSelecionavel) => void;
  readonly onRemover: (chave: string) => void;
}

function ListaCardapio({ vazio, itens, descricoes, quantidades, onAdicionar, onRemover }: Readonly<CardapioListaProps>) {
  if (itens.length === 0) {
    return <p style={{ color: '#d7c9c4' }}>{vazio}</p>;
  }

  return (
    <GradeItens>
      {itens.map((item) => {
        const quantidade = quantidades[item.chave] ?? 0;
        return (
          <CartaoItem key={item.chave}>
            <NomeItem>{item.nome}</NomeItem>
            <DescricaoItem>{descricoes[item.chave] ?? ''}</DescricaoItem>
            <LinhaPrecoAcao>
              <Preco>{formatarPreco(item.precoUnitario)}</Preco>
              {quantidade === 0 ? (
                <BotaoAdicionar onClick={() => onAdicionar(item)}>Adicionar</BotaoAdicionar>
              ) : (
                <ControleQuantidade>
                  <button type="button" onClick={() => onRemover(item.chave)} aria-label={`Remover um ${item.nome}`}>−</button>
                  <span>{quantidade}</span>
                  <button type="button" onClick={() => onAdicionar(item)} aria-label={`Adicionar um ${item.nome}`}>+</button>
                </ControleQuantidade>
              )}
            </LinhaPrecoAcao>
          </CartaoItem>
        );
      })}
    </GradeItens>
  );
}

export function TotemPage() {
  const [etapa, setEtapa] = useState<Etapa>('boasVindas');
  const [categoria, setCategoria] = useState<CategoriaCardapio>('pizza');
  const [nomeCliente, setNomeCliente] = useState('');
  const [modoConsumo, setModoConsumo] = useState<ModoConsumo>('');
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [gorjetaPercentual, setGorjetaPercentual] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | ''>('');
  const [dadosCartao, setDadosCartao] = useState<DadosCartao>(DADOS_CARTAO_INICIAIS);
  const [errosCartao, setErrosCartao] = useState<ErrosCartao>({});
  const [pedidoConcluido, setPedidoConcluido] = useState<PedidoApi | null>(null);
  const [erroEnvio, setErroEnvio] = useState('');
  const [contagemRegressiva, setContagemRegressiva] = useState(SEGUNDOS_PARA_REINICIAR);

  const seletor = useSeletorItens();

  const { data: pizzas } = usePizzas();
  const { data: bebidas } = useBebidas();
  const { data: combos } = useCombos();

  const quantidadesPorChave = useMemo(() => {
    const mapa: Record<string, number> = {};
    seletor.itens.forEach((item) => {
      mapa[item.chave] = item.quantidade;
    });
    return mapa;
  }, [seletor.itens]);

  const itensPizza: ItemSelecionavel[] = useMemo(
    () => (pizzas ?? []).map((pizza) => ({
      chave: `pizza-${pizza.id}`,
      tipo: 'pizza' as const,
      id: pizza.id,
      nome: pizza.nome,
      precoUnitario: Number(pizza.precoBase),
    })),
    [pizzas],
  );

  const descricoesPizza = useMemo(() => {
    const mapa: Record<string, string> = {};
    (pizzas ?? []).forEach((pizza) => { mapa[`pizza-${pizza.id}`] = pizza.descricao; });
    return mapa;
  }, [pizzas]);

  const itensBebida: ItemSelecionavel[] = useMemo(
    () => (bebidas ?? []).map((bebida) => ({
      chave: `bebida-${bebida.id}`,
      tipo: 'bebida' as const,
      id: String(bebida.id),
      nome: bebida.nome,
      precoUnitario: bebida.preco,
    })),
    [bebidas],
  );

  const descricoesBebida = useMemo(() => {
    const mapa: Record<string, string> = {};
    (bebidas ?? []).forEach((bebida) => { mapa[`bebida-${bebida.id}`] = bebida.descricao; });
    return mapa;
  }, [bebidas]);

  const itensCombo: ItemSelecionavel[] = useMemo(
    () => (combos ?? []).map((combo) => ({
      chave: `combo-${combo.id}`,
      tipo: 'combo' as const,
      id: combo.id,
      nome: combo.nome,
      precoUnitario: Number(combo.precoBase),
    })),
    [combos],
  );

  const descricoesCombo = useMemo(() => {
    const mapa: Record<string, string> = {};
    (combos ?? []).forEach((combo) => { mapa[`combo-${combo.id}`] = combo.descricao; });
    return mapa;
  }, [combos]);

  const valorGorjeta = Number(((seletor.total * gorjetaPercentual) / 100).toFixed(2));
  const totalComGorjeta = Number((seletor.total + valorGorjeta).toFixed(2));

  // O código Pix é só ilustrativo aqui: o pedido (e seu id de verdade) só é
  // criado no back-end depois que o pagamento é "confirmado".
  const codigoPixSimulado = useMemo(
    () => gerarCodigoPixCopiaCola(nomeCliente || 'totem', totalComGorjeta),
    [nomeCliente, totalComGorjeta],
  );

  function reiniciarTotem() {
    seletor.limpar();
    setNomeCliente('');
    setModoConsumo('');
    setMesaSelecionada(null);
    setGorjetaPercentual(0);
    setFormaPagamento('');
    setDadosCartao(DADOS_CARTAO_INICIAIS);
    setErrosCartao({});
    setPedidoConcluido(null);
    setErroEnvio('');
    setEtapa('boasVindas');
  }

  useEffect(() => {
    if (etapa !== 'sucesso') return;

    setContagemRegressiva(SEGUNDOS_PARA_REINICIAR);
    const intervalo = window.setInterval(() => {
      setContagemRegressiva((atual) => {
        if (atual <= 1) {
          window.clearInterval(intervalo);
          reiniciarTotem();
          return SEGUNDOS_PARA_REINICIAR;
        }
        return atual - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa]);

  async function confirmarPedido() {
    if (!formaPagamento) return;

    setEtapa('processando');
    setErroEnvio('');

    await simularProcessamentoPagamento();

    const infoPagamento = montarInfoPagamentoSimulado(formaPagamento, {
      pedidoId: crypto.randomUUID(),
      total: totalComGorjeta,
      dadosCartao,
    });

    try {
      const pedidoEnviado = await enviarPedidoLocal({
        canal: 'totem',
        mesa: modoConsumo === 'mesa' ? mesaSelecionada : null,
        cliente: { nome: nomeCliente.trim() || 'Cliente do totem' },
        itens: seletor.itens,
        gorjeta: gorjetaPercentual > 0 ? { percentual: gorjetaPercentual, valor: valorGorjeta } : null,
        pagamento: infoPagamento,
      });

      setPedidoConcluido(pedidoEnviado);
      setEtapa('sucesso');
    } catch (erro) {
      setErroEnvio(erro instanceof Error ? erro.message : 'Não foi possível enviar o pedido. Chame um atendente.');
      setEtapa('pagamento');
    }
  }

  function handleSubmitCartao(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const erros = validarDadosCartao(dadosCartao);
    setErrosCartao(erros);
    if (Object.keys(erros).length > 0) return;
    void confirmarPedido();
  }

  const podeAvancarParaPagamento = nomeCliente.trim().length >= 2
    && modoConsumo !== ''
    && (modoConsumo !== 'mesa' || mesaSelecionada !== null);

  return (
    <Tela>
      <TopoTotem>
        <MarcaTotem>
          <span className="icone">🍕</span>
          <span className="texto">Pizzaria Callidus — Totem</span>
        </MarcaTotem>
        <Link to="/">Sair do totem</Link>
      </TopoTotem>

      <Corpo>
        {etapa === 'boasVindas' && (
          <BoasVindasWrap>
            <h1>Bem-vindo(a)!</h1>
            <p>Monte seu pedido na tela, escolha se vai comer aqui ou levar, pague e pronto — o pedido já vai direto para o nosso atendimento.</p>
            <BotaoGigante onClick={() => setEtapa('cardapio')}>Toque para começar</BotaoGigante>
          </BoasVindasWrap>
        )}

        {etapa === 'cardapio' && (
          <>
            <Cabecalho>
              <h2>Monte seu pedido</h2>
              <p>Escolha pizzas, bebidas e combos. Você pode revisar tudo antes de pagar.</p>
            </Cabecalho>

            <Abas>
              <Aba type="button" $ativa={categoria === 'pizza'} onClick={() => setCategoria('pizza')}>🍕 Pizzas</Aba>
              <Aba type="button" $ativa={categoria === 'bebida'} onClick={() => setCategoria('bebida')}>🥤 Bebidas</Aba>
              <Aba type="button" $ativa={categoria === 'combo'} onClick={() => setCategoria('combo')}>🎉 Combos</Aba>
            </Abas>

            {categoria === 'pizza' && (
              <ListaCardapio
                vazio="Nenhuma pizza disponível."
                itens={itensPizza}
                descricoes={descricoesPizza}
                quantidades={quantidadesPorChave}
                onAdicionar={(item) => seletor.adicionar(item)}
                onRemover={(chave) => seletor.remover(chave)}
              />
            )}
            {categoria === 'bebida' && (
              <ListaCardapio
                vazio="Nenhuma bebida disponível."
                itens={itensBebida}
                descricoes={descricoesBebida}
                quantidades={quantidadesPorChave}
                onAdicionar={(item) => seletor.adicionar(item)}
                onRemover={(chave) => seletor.remover(chave)}
              />
            )}
            {categoria === 'combo' && (
              <ListaCardapio
                vazio="Nenhum combo disponível."
                itens={itensCombo}
                descricoes={descricoesCombo}
                quantidades={quantidadesPorChave}
                onAdicionar={(item) => seletor.adicionar(item)}
                onRemover={(chave) => seletor.remover(chave)}
              />
            )}

            <BarraCarrinho>
              <ResumoCarrinhoMini>
                <strong>{seletor.quantidadeTotal} item(ns)</strong>
                <span>{formatarPreco(seletor.total)}</span>
              </ResumoCarrinhoMini>
              <BotaoPrimario type="button" disabled={seletor.quantidadeTotal === 0} onClick={() => setEtapa('carrinho')}>
                Ver carrinho
              </BotaoPrimario>
            </BarraCarrinho>
          </>
        )}

        {etapa === 'carrinho' && (
          <>
            <Cabecalho>
              <h2>Seu carrinho</h2>
              <p>Confira os itens antes de continuar.</p>
            </Cabecalho>

            {seletor.itens.length === 0 ? (
              <p style={{ color: '#d7c9c4' }}>Seu carrinho está vazio.</p>
            ) : (
              <ListaCarrinho>
                {seletor.itens.map((item) => (
                  <LinhaCarrinho key={item.chave}>
                    <div className="info">
                      <strong>{item.quantidade}x {item.nome}</strong>
                      <span>{formatarPreco(item.precoUnitario)} cada</span>
                    </div>
                    <ControleQuantidade>
                      <button type="button" onClick={() => seletor.remover(item.chave)} aria-label={`Remover um ${item.nome}`}>−</button>
                      <span>{item.quantidade}</span>
                      <button type="button" onClick={() => seletor.adicionar(item)} aria-label={`Adicionar um ${item.nome}`}>+</button>
                    </ControleQuantidade>
                  </LinhaCarrinho>
                ))}
              </ListaCarrinho>
            )}

            <Rodape>
              <BotaoSecundario type="button" onClick={() => setEtapa('cardapio')}>Continuar escolhendo</BotaoSecundario>
              <BotaoPrimario type="button" disabled={seletor.itens.length === 0} onClick={() => setEtapa('entrega')}>
                Continuar — {formatarPreco(seletor.total)}
              </BotaoPrimario>
            </Rodape>
          </>
        )}

        {etapa === 'entrega' && (
          <>
            <Cabecalho>
              <h2>Só mais um pouco</h2>
              <p>Precisamos saber seu nome e onde você vai ficar.</p>
            </Cabecalho>

            <Formulario>
              <Campo>
                Seu nome
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Como podemos te chamar?"
                />
              </Campo>

              <div>
                <p style={{ margin: '0 0 0.6rem', fontWeight: 700 }}>Onde você vai consumir?</p>
                <OpcoesModo>
                  <OpcaoModo type="button" $selecionada={modoConsumo === 'mesa'} onClick={() => setModoConsumo('mesa')}>
                    <strong>🍽️ Vou comer aqui</strong>
                    <span>O garçom entrega direto na sua mesa</span>
                  </OpcaoModo>
                  <OpcaoModo type="button" $selecionada={modoConsumo === 'balcao'} onClick={() => { setModoConsumo('balcao'); setMesaSelecionada(null); }}>
                    <strong>🥡 Vou retirar no balcão</strong>
                    <span>Aguarde ser chamado(a) pelo nome</span>
                  </OpcaoModo>
                </OpcoesModo>
              </div>

              {modoConsumo === 'mesa' && (
                <Campo>
                  Número da mesa
                  <select
                    value={mesaSelecionada ?? ''}
                    onChange={(e) => setMesaSelecionada(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Selecione sua mesa</option>
                    {NUMEROS_DAS_MESAS.map((numero) => (
                      <option key={numero} value={numero}>Mesa {numero}</option>
                    ))}
                  </select>
                </Campo>
              )}

              <div>
                <p style={{ margin: '0 0 0.6rem', fontWeight: 700 }}>Quer deixar uma gorjeta?</p>
                <OpcoesGorjeta>
                  {OPCOES_GORJETA.map((percentual) => (
                    <OpcaoGorjeta
                      key={percentual}
                      type="button"
                      $selecionada={gorjetaPercentual === percentual}
                      onClick={() => setGorjetaPercentual(percentual)}
                    >
                      {percentual === 0 ? 'Sem gorjeta' : `${percentual}%`}
                    </OpcaoGorjeta>
                  ))}
                </OpcoesGorjeta>
              </div>
            </Formulario>

            <Rodape>
              <BotaoSecundario type="button" onClick={() => setEtapa('carrinho')}>Voltar</BotaoSecundario>
              <BotaoPrimario type="button" disabled={!podeAvancarParaPagamento} onClick={() => setEtapa('pagamento')}>
                Ir para pagamento — {formatarPreco(totalComGorjeta)}
              </BotaoPrimario>
            </Rodape>
          </>
        )}

        {etapa === 'pagamento' && (
          <>
            <Cabecalho>
              <h2>Pagamento</h2>
              <p>Simulação de pagamento — nenhum dado é enviado a serviços externos.</p>
            </Cabecalho>

            {erroEnvio && <ErroTexto role="alert">{erroEnvio}</ErroTexto>}

            <OpcoesPagamento>
              {FORMAS_PAGAMENTO.map((forma) => (
                <OpcaoPagamento
                  key={forma.valor}
                  type="button"
                  $selecionada={formaPagamento === forma.valor}
                  onClick={() => setFormaPagamento(forma.valor)}
                >
                  <strong>{forma.rotulo}</strong>
                  <span>{forma.descricao}</span>
                </OpcaoPagamento>
              ))}
            </OpcoesPagamento>

            {formaPagamento === 'pix' && (
              <CartaoPix style={{ marginTop: '1.5rem' }}>
                <img src={gerarUrlQrCodePix(codigoPixSimulado)} alt="QR Code Pix (simulado)" width={180} height={180} />
                <p>Escaneie para pagar {formatarPreco(totalComGorjeta)}</p>
                <Rodape>
                  <BotaoSecundario type="button" onClick={() => setEtapa('entrega')}>Voltar</BotaoSecundario>
                  <BotaoPrimario type="button" onClick={() => void confirmarPedido()}>Já paguei</BotaoPrimario>
                </Rodape>
              </CartaoPix>
            )}

            {formaPagamento === 'dinheiro' && (
              <div style={{ marginTop: '1.5rem' }}>
                <p>Pague {formatarPreco(totalComGorjeta)} em dinheiro no caixa ao retirar/receber o pedido.</p>
                <Rodape>
                  <BotaoSecundario type="button" onClick={() => setEtapa('entrega')}>Voltar</BotaoSecundario>
                  <BotaoPrimario type="button" onClick={() => void confirmarPedido()}>Confirmar pedido</BotaoPrimario>
                </Rodape>
              </div>
            )}

            {formaPagamento === 'cartao' && (
              <form onSubmit={handleSubmitCartao} style={{ marginTop: '1.5rem' }}>
                <Formulario>
                  <Campo>
                    Número do cartão
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={dadosCartao.numero}
                      onChange={(e) => setDadosCartao((atuais) => ({ ...atuais, numero: mascararNumeroCartao(e.target.value) }))}
                    />
                    {errosCartao.numero && <ErroTexto>{errosCartao.numero}</ErroTexto>}
                  </Campo>
                  <Campo>
                    Nome impresso no cartão
                    <input
                      type="text"
                      value={dadosCartao.nomeImpresso}
                      onChange={(e) => setDadosCartao((atuais) => ({ ...atuais, nomeImpresso: e.target.value }))}
                    />
                    {errosCartao.nomeImpresso && <ErroTexto>{errosCartao.nomeImpresso}</ErroTexto>}
                  </Campo>
                  <Campo>
                    Validade
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      value={dadosCartao.validade}
                      onChange={(e) => setDadosCartao((atuais) => ({ ...atuais, validade: mascararValidadeCartao(e.target.value) }))}
                    />
                    {errosCartao.validade && <ErroTexto>{errosCartao.validade}</ErroTexto>}
                  </Campo>
                  <Campo>
                    CVV
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000"
                      value={dadosCartao.cvv}
                      onChange={(e) => setDadosCartao((atuais) => ({ ...atuais, cvv: mascararCvv(e.target.value) }))}
                    />
                    {errosCartao.cvv && <ErroTexto>{errosCartao.cvv}</ErroTexto>}
                  </Campo>
                </Formulario>
                <Rodape>
                  <BotaoSecundario type="button" onClick={() => setEtapa('entrega')}>Voltar</BotaoSecundario>
                  <BotaoPrimario type="submit">Pagar {formatarPreco(totalComGorjeta)}</BotaoPrimario>
                </Rodape>
              </form>
            )}
          </>
        )}

        {etapa === 'processando' && (
          <BoasVindasWrap>
            <h1>Processando pagamento...</h1>
            <p>Só um instante.</p>
          </BoasVindasWrap>
        )}

        {etapa === 'sucesso' && pedidoConcluido && (
          <SucessoWrap>
            <div className="icone">✓</div>
            <h2>Pedido enviado!</h2>
            <p className="numero">Pedido nº {pedidoConcluido.pedidoId.slice(0, 8).toUpperCase()}</p>
            {modoConsumo === 'mesa' && mesaSelecionada
              ? <p>Pode ir para a mesa {mesaSelecionada}. O garçom leva seu pedido assim que estiver pronto.</p>
              : <p>Aguarde no balcão — vamos chamar {nomeCliente || 'você'} quando estiver pronto.</p>}
            <BotaoPrimario type="button" onClick={reiniciarTotem}>Fazer novo pedido</BotaoPrimario>
            <span style={{ color: '#8a7a75', fontSize: '0.8rem' }}>Voltando ao início em {contagemRegressiva}s...</span>
          </SucessoWrap>
        )}
      </Corpo>
    </Tela>
  );
}
