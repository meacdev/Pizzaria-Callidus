import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { usePedidoStore, type Pedido } from '../../../store/pedido.store';
import { buscarPedido } from '../api/pedido.service';
import { StatusTimeline } from '../components/StatusTimeline';
import { MensagemErro } from '../../../component/MensagemErro';

export function AcompanhamentoPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const local = usePedidoStore((state) => state.pedidos.find((p) => p.id === id));
  const substituirPedido = usePedidoStore((state) => state.substituirPedido);
  const [pedido, setPedido] = useState<Pedido | null>(local ?? null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    const carregar = async () => {
      try {
        const atual = await buscarPedido(id);
        if (ativo) { setPedido(atual); substituirPedido(atual); setErro(''); }
      } catch (e) {
        if (ativo && !local) setErro(e instanceof Error ? e.message : 'Pedido não encontrado.');
      }
    };
    void carregar();
    const timer = window.setInterval(() => void carregar(), 4000);
    return () => { ativo = false; window.clearInterval(timer); };
  }, [id, local?.id, substituirPedido]);

  if (!pedido) return <MensagemErro titulo="Pedido não encontrado" mensagem={erro || 'Verifique o link ou faça um novo pedido.'} />;
  const finalizado = pedido.status === 'entregue' || pedido.status === 'cancelado';
  return <main className="principal cabecalho-pagina">
    <span className="tag">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</span>
    <StatusTimeline statusAtual={pedido.status} />
    {!finalizado && <p>O status é atualizado automaticamente pela cozinha e pela equipe de entrega.</p>}
    <div className="acoes-pagina"><Link className="botao-secundario" to="/">Voltar ao início</Link></div>
  </main>;
}
