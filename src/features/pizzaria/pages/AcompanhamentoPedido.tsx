import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { usePedidoStore } from '../../../store/pedido.store';
import { useEntregaStore } from '../../../store/entrega.store';
import { StatusTimeline } from '../components/StatusTimeline';
import { MensagemErro } from '../../../component/MensagemErro';

export function AcompanhamentoPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const pedido = usePedidoStore((state) => state.pedidos.find((p) => p.id === id));
  const iniciarAcompanhamento = useEntregaStore((state) => state.iniciarAcompanhamento);

  useEffect(() => {
    if (pedido) iniciarAcompanhamento(pedido.id, pedido.status);
  }, [pedido?.id, pedido?.status, iniciarAcompanhamento]);

  if (!pedido) {
    return <MensagemErro titulo="Pedido não encontrado" mensagem="Verifique o link ou faça um novo pedido no cardápio." />;
  }

  return (
    <main className="principal cabecalho-pagina">
      <span className="tag">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</span>
      <StatusTimeline statusAtual={pedido.status} />
      <div className="acoes-pagina">
        <Link className="botao-secundario" to="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
