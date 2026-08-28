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
  const iniciarSimulacaoAutomatica = useEntregaStore((state) => state.iniciarSimulacaoAutomatica);
  const pararSimulacao = useEntregaStore((state) => state.pararSimulacao);
  const simulacaoAtiva = useEntregaStore((state) =>
    id ? Boolean(state.pedidosAtivos[id]?.simulacaoTimerId) : false,
  );

  useEffect(() => {
    if (pedido) {
      iniciarAcompanhamento(pedido.id, pedido.status);
    }
  }, [pedido?.id]);

  // pausa o timer se o usuário sair da página
  useEffect(() => {
    return () => {
      if (id) pararSimulacao(id);
    };
  }, [id]);

  if (!pedido) {
    return (
      <MensagemErro
        titulo="Pedido não encontrado"
        mensagem="Verifique o link ou faça um novo pedido no cardápio."
      />
    );
  }

  const finalizado = pedido.status === 'entregue' || pedido.status === 'cancelado';

  return (
    <main className="principal cabecalho-pagina">
      <span className="tag">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</span>

      <StatusTimeline statusAtual={pedido.status} />

      {!finalizado && (
        <div className="acoes-pagina">
          {simulacaoAtiva ? (
            <button type="button" className="botao-secundario" onClick={() => pararSimulacao(pedido.id)}>
              Parar simulação automática
            </button>
          ) : (
            <button
              type="button"
              className="botao-primario"
              onClick={() => iniciarSimulacaoAutomatica(pedido.id)}
            >
              Simular avanço automático
            </button>
          )}
        </div>
      )}

      <div className="acoes-pagina">
        <Link className="botao-secundario" to="/">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}