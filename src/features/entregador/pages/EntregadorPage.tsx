import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { listarPedidos, atualizarStatusPedidoApi, type PedidoApi } from '../../pizzaria/api/pedido.service';
import { useEntregaStore } from '../../../store/entrega.store';
import { useFuncionarioAuth } from '../../funcionarios/context/FuncionarioAuthContext';
import styles from './EntregadorPage.module.css';

function formatarPreco(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function endereco(pedido: PedidoApi) {
  const e = pedido.endereco;
  return `${e.rua}, ${e.numero}${e.complemento ? ` - ${e.complemento}` : ''} • ${e.bairro} • ${e.cidade}`;
}

function itens(pedido: PedidoApi) {
  return pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ');
}

function idCurto(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function EntregadorPage() {
  const [pedidos, setPedidos] = useState<PedidoApi[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const pedidosNaRota = useEntregaStore((state) => state.pedidosNaRota);
  const adicionarPedidoNaRota = useEntregaStore((state) => state.adicionarPedidoNaRota);
  const removerPedidoDaRota = useEntregaStore((state) => state.removerPedidoDaRota);
  const { funcionario, sair } = useFuncionarioAuth();
  const navigate = useNavigate();

  async function carregarPedidos() {
    try {
      const dados = await listarPedidos();
      setPedidos(dados);
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os pedidos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarPedidos();
    const intervalo = window.setInterval(() => void carregarPedidos(), 5000);
    return () => window.clearInterval(intervalo);
  }, []);

  function sairDaConta() {
    sair();
    navigate('/admin');
  }

  const prontos = useMemo(
    () => pedidos.filter((pedido) => pedido.status === 'pronto' && !pedidosNaRota.includes(pedido.pedidoId)),
    [pedidos, pedidosNaRota],
  );

  const rota = useMemo(
    () => pedidos.filter((pedido) => pedido.status === 'saiu_para_entrega' && pedidosNaRota.includes(pedido.pedidoId)),
    [pedidos, pedidosNaRota],
  );

  function alternarSelecao(id: string) {
    setSelecionados((atual) => atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]);
  }

  async function iniciarRota() {
    const ids = [...selecionados];
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => atualizarStatusPedidoApi(id, 'saiu_para_entrega')));
      ids.forEach(adicionarPedidoNaRota);
      setSelecionados([]);
      setMensagem(`${ids.length} pedido(s) adicionado(s) à sua rota.`);
      await carregarPedidos();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível iniciar a rota.');
    }
  }

  async function entregar(pedido: PedidoApi) {
    try {
      await atualizarStatusPedidoApi(pedido.pedidoId, 'entregue');
      removerPedidoDaRota(pedido.pedidoId);
      setMensagem(`Pedido #${idCurto(pedido.pedidoId)} entregue. A empresa foi notificada.`);
      await carregarPedidos();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível concluir a entrega.');
    }
  }

  async function removerDaRota(pedido: PedidoApi) {
    try {
      await atualizarStatusPedidoApi(pedido.pedidoId, 'pronto');
      removerPedidoDaRota(pedido.pedidoId);
      setMensagem(`Pedido #${idCurto(pedido.pedidoId)} voltou a ficar disponível para entrega.`);
      await carregarPedidos();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível devolver o pedido.');
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Painel do entregador</div>
          <h1 className={styles.title}>Pedidos para entrega</h1>
          <p className={styles.subtitle}>
            Olá, {funcionario?.nome}. Os pedidos marcados como “Concluído / aguardando envio” pela cozinha aparecem aqui automaticamente.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} to="/">Voltar ao início</Link>
          <button className={styles.secondary} type="button" onClick={sairDaConta}>Sair</button>
        </div>
      </header>

      {mensagem && <div className={styles.notice} role="status">{mensagem}</div>}
      {erro && <div className={styles.notice} role="alert">{erro}</div>}

      <section className={styles.summary} aria-label="Resumo da rota">
        <div className={styles.summaryCard}><span className={styles.summaryLabel}>Prontos para entrega</span><span className={styles.summaryValue}>{prontos.length}</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryLabel}>Pedidos selecionados</span><span className={styles.summaryValue}>{selecionados.length}</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryLabel}>Na minha rota</span><span className={styles.summaryValue}>{rota.length}</span></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Disponíveis para entrega</h2>
          <span>Pedidos concluídos pela cozinha</span>
        </div>

        {carregando ? (
          <div className={styles.empty}>Carregando pedidos...</div>
        ) : prontos.length === 0 ? (
          <div className={styles.empty}>Nenhum pedido está aguardando entregador.</div>
        ) : (
          <div className={styles.grid}>
            {prontos.map((pedido) => {
              const selecionado = selecionados.includes(pedido.pedidoId);
              return (
                <article key={pedido.pedidoId} className={`${styles.card} ${selecionado ? styles.cardSelected : ''}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.orderId}>#{idCurto(pedido.pedidoId)}</span>
                    <input className={styles.checkbox} type="checkbox" checked={selecionado} onChange={() => alternarSelecao(pedido.pedidoId)} aria-label={`Selecionar pedido #${idCurto(pedido.pedidoId)}`} />
                  </div>
                  <div className={styles.customer}>{pedido.cliente.nome}</div>
                  <div className={styles.address}>{endereco(pedido)}</div>
                  <div className={styles.items}>{itens(pedido)}</div>
                  <div className={styles.total}>{formatarPreco(pedido.total)}</div>
                </article>
              );
            })}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.primary} type="button" disabled={selecionados.length === 0} onClick={() => void iniciarRota()}>
            Aceitar e iniciar rota com {selecionados.length} pedido(s)
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Minha rota</h2>
          <span>Entregas em andamento</span>
        </div>

        {rota.length === 0 ? (
          <div className={styles.empty}>Aceite pedidos disponíveis para montar sua rota.</div>
        ) : (
          <div className={styles.route}>
            <div className={styles.routeList}>
              {rota.map((pedido, index) => (
                <article className={styles.routeItem} key={pedido.pedidoId}>
                  <span className={styles.position}>{index + 1}</span>
                  <div>
                    <strong>#{idCurto(pedido.pedidoId)} • {pedido.cliente.nome}</strong>
                    <div className={styles.routeAddress}>{endereco(pedido)}</div>
                  </div>
                  <div className={styles.actions}>
                    <Link className={styles.secondary} to={`/pedido/${pedido.pedidoId}`}>Acompanhar</Link>
                    <button className={styles.primary} type="button" onClick={() => void entregar(pedido)}>Marcar como entregue</button>
                    <button className={styles.danger} type="button" onClick={() => void removerDaRota(pedido)}>Devolver aos disponíveis</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
