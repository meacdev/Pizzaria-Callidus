import { Link } from 'react-router';
import { MensagemErro } from '../../../component/MensagemErro';
import { STATUS_PEDIDO_LABEL, usePedidoStore } from '../../../store/pedido.store';
import { ResumoPedido } from '../components/ResumoPedido';
import { FORMAS_PAGAMENTO } from '../types/checkout';

export function PagamentoPage() {
  const pedido = usePedidoStore((state) => state.pedido);

  if (!pedido) {
    return (
      <MensagemErro
        titulo="Nenhum pedido em andamento"
        mensagem="Finalize o checkout para ver esta página."
      />
    );
  }

  const formaPagamento = FORMAS_PAGAMENTO.find((forma) => forma.valor === pedido.dados.formaPagamento);

  return (
    <>
      <main className="principal cabecalho-pagina">
        <span className="tag">Pagamento</span>
        <h1>Tela de pagamento em construção</h1>
        <p>
          Seu checkout foi confirmado! O pagamento via <strong>{formaPagamento?.rotulo ?? pedido.dados.formaPagamento}</strong> será
          implementado em breve.
        </p>
        <p>
          Pedido <strong>#{pedido.id.slice(0, 8).toUpperCase()}</strong> — status atual:{' '}
          <strong>{STATUS_PEDIDO_LABEL[pedido.status]}</strong>
        </p>
        <div className="acoes-pagina">
          <Link className="botao-secundario" to="/cardapio">Voltar ao cardápio</Link>
        </div>
      </main>

      <div className="principal">
        <ResumoPedido
          itens={pedido.itens.map((item) => ({
            id: item.id,
            nome: item.nome,
            precoUnitario: item.precoUnitario,
            quantidade: item.quantidade,
          }))}
          total={pedido.total}
        />
      </div>
    </>
  );
}
