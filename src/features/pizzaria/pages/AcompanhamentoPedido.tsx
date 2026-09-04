import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { usePedidoStore } from '../../../store/pedido.store';
import { useEntregaStore } from '../../../store/entrega.store';
import { obterPedido, type PedidoApi } from '../api/pedido.service';
import { StatusTimeline } from '../components/StatusTimeline';
import { MensagemErro } from '../../../component/MensagemErro';

const INTERVALO_ATUALIZACAO_MS = 3000;

export function AcompanhamentoPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const pedidoLocal = usePedidoStore((state) => state.pedidos.find((p) => p.id === id));
  const iniciarAcompanhamento = useEntregaStore((state) => state.iniciarAcompanhamento);
  const [pedido, setPedido] = useState<PedidoApi | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) {
      setCarregando(false);
      setErro('Identificador do pedido não informado.');
      return;
    }

    let ativo = true;
    const pedidoId = id;

    async function carregarPedido() {
      try {
        const pedidoAtualizado = await obterPedido(pedidoId);
        if (!ativo) return;
        setPedido(pedidoAtualizado);
        setErro('');
      } catch (e) {
        if (!ativo) return;

        // Permite exibir o pedido recém-criado mesmo se o backend ainda não
        // estiver disponível. Assim que a API responder, ela passa a ser a
        // fonte oficial do status.
        if (pedidoLocal) {
          setErro('Não foi possível sincronizar agora. Exibindo o último status disponível.');
        } else {
          setErro(e instanceof Error ? e.message : 'Não foi possível carregar o pedido.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarPedido();
    const intervalo = window.setInterval(() => void carregarPedido(), INTERVALO_ATUALIZACAO_MS);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [id, pedidoLocal]);

  const statusAtual = pedido?.status ?? pedidoLocal?.status;

  useEffect(() => {
    if (id && statusAtual) {
      iniciarAcompanhamento(id, statusAtual);
    }
  }, [id, statusAtual, iniciarAcompanhamento]);

  if (carregando && !pedido && !pedidoLocal) {
    return (
      <main className="principal cabecalho-pagina">
        <p>Carregando acompanhamento do pedido...</p>
      </main>
    );
  }

  if (!statusAtual) {
    return (
      <MensagemErro
        titulo="Pedido não encontrado"
        mensagem="Verifique o link ou faça um novo pedido no cardápio."
      />
    );
  }

  return (
    <main className="principal cabecalho-pagina">
      <span className="tag">Pedido #{id?.slice(0, 8).toUpperCase()}</span>

      {erro && (
        <p role="status" aria-live="polite">
          {erro}
        </p>
      )}

      <StatusTimeline statusAtual={statusAtual} />

      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
        O status é atualizado automaticamente.
      </p>

      <div className="acoes-pagina">
        <Link className="botao-secundario" to="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
