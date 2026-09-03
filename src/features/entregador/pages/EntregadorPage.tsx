import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { usePedidoStore, type Pedido } from '../../../store/pedido.store';
import { useEntregaStore } from '../../../store/entrega.store';
import styles from './EntregadorPage.module.css';

function formatarPreco(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function endereco(pedido: Pedido) {
  const e = pedido.dados.endereco;
  return `${e.rua}, ${e.numero}${e.complemento ? ` - ${e.complemento}` : ''} • ${e.bairro} • ${e.cidade}`;
}

function itens(pedido: Pedido) {
  return pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ');
}

export function EntregadorPage() {
  const pedidos = usePedidoStore((state) => state.pedidos);
  const atualizarStatusPedido = usePedidoStore((state) => state.atualizarStatusPedido);
  const pedidosNaRota = useEntregaStore((state) => state.pedidosNaRota);
  const adicionarPedidoNaRota = useEntregaStore((state) => state.adicionarPedidoNaRota);
  const removerPedidoDaRota = useEntregaStore((state) => state.removerPedidoDaRota);
  const concluirEntrega = useEntregaStore((state) => state.concluirEntrega);

  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');

  const prontos = useMemo(
    () => pedidos.filter((pedido) => pedido.status === 'pronto' && !pedidosNaRota.includes(pedido.id)),
    [pedidos, pedidosNaRota],
  );

  const rota = useMemo(
    () => pedidosNaRota
      .map((id) => pedidos.find((pedido) => pedido.id === id))
      .filter((pedido): pedido is Pedido => Boolean(pedido) && pedido.status === 'saiu_para_entrega'),
    [pedidos, pedidosNaRota],
  );

  function alternarSelecao(id: string) {
    setSelecionados((atual) => atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]);
  }

  function iniciarRota() {
    selecionados.forEach((id) => {
      atualizarStatusPedido(id, 'saiu_para_entrega');
      adicionarPedidoNaRota(id);
    });
    setSelecionados([]);
    setMensagem(`${selecionados.length} pedido(s) adicionado(s) à sua rota.`);
  }

  function entregar(pedido: Pedido) {
    concluirEntrega(pedido.id);
    setMensagem(`Pedido #${pedido.id.slice(0, 8).toUpperCase()} entregue. A empresa foi notificada.`);
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Painel do entregador</div>
          <h1 className={styles.title}>Pedidos para entrega</h1>
          <p className={styles.subtitle}>
            Escolha os pedidos que deseja levar. Ao iniciar a rota, o acompanhamento do cliente passa para “Saiu para entrega”.
          </p>
        </div>
        <Link className={styles.secondary} to="/">Voltar ao início</Link>
      </header>

      {mensagem && <div className={styles.notice} role="status">{mensagem}</div>}

      <section className={styles.summary} aria-label="Resumo da rota">
        <div className={styles.summaryCard}><span className={styles.summaryLabel}>Prontos para entrega</span><span className={styles.summaryValue}>{prontos.length}</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryLabel}>Pedidos selecionados</span><span className={styles.summaryValue}>{selecionados.length}</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryLabel}>Na minha rota</span><span className={styles.summaryValue}>{rota.length}</span></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Prontos para entrega</h2>
          <span>Marcados pela cozinha</span>
        </div>

        {prontos.length === 0 ? (
          <div className={styles.empty}>Nenhum pedido está aguardando entregador.</div>
        ) : (
          <div className={styles.grid}>
            {prontos.map((pedido) => {
              const selecionado = selecionados.includes(pedido.id);
              return (
                <article key={pedido.id} className={`${styles.card} ${selecionado ? styles.cardSelected : ''}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.orderId}>#{pedido.id.slice(0, 8).toUpperCase()}</span>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => alternarSelecao(pedido.id)}
                      aria-label={`Selecionar pedido #${pedido.id.slice(0, 8).toUpperCase()}`}
                    />
                  </div>
                  <div className={styles.customer}>{pedido.dados.cliente.nome}</div>
                  <div className={styles.address}>{endereco(pedido)}</div>
                  <div className={styles.items}>{itens(pedido)}</div>
                  <div className={styles.total}>{formatarPreco(pedido.total)}</div>
                </article>
              );
            })}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.primary} type="button" disabled={selecionados.length === 0} onClick={iniciarRota}>
            Iniciar rota com {selecionados.length} pedido(s)
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Minha rota</h2>
          <span>Entregas em andamento</span>
        </div>

        {rota.length === 0 ? (
          <div className={styles.empty}>Selecione pedidos prontos para montar sua rota.</div>
        ) : (
          <div className={styles.route}>
            <div className={styles.routeList}>
              {rota.map((pedido, index) => (
                <article className={styles.routeItem} key={pedido.id}>
                  <span className={styles.position}>{index + 1}</span>
                  <div>
                    <strong>#{pedido.id.slice(0, 8).toUpperCase()} • {pedido.dados.cliente.nome}</strong>
                    <div className={styles.routeAddress}>{endereco(pedido)}</div>
                  </div>
                  <div className={styles.actions}>
                    <Link className={styles.secondary} to={`/pedido/${pedido.id}`}>Acompanhar</Link>
                    <button className={styles.primary} type="button" onClick={() => entregar(pedido)}>Marcar como entregue</button>
                    <button className={styles.danger} type="button" onClick={() => removerPedidoDaRota(pedido.id)}>Remover da rota</button>
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
