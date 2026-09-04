import { useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { usePedidoStore, STATUS_PEDIDO_LABEL } from '../../../store/pedido.store';

const Lista = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;`;
const Card = styled.article`background:#fff;border-radius:16px;padding:1.25rem;box-shadow:0 4px 16px rgba(15,23,42,.06);border:1px solid #e5e7eb;`;
const Status = styled.span`display:inline-block;padding:.35rem .65rem;border-radius:999px;background:#f3f4f6;font-size:.8rem;font-weight:700;`;
const Botao = styled(Link)`display:inline-block;margin-top:.75rem;padding:.65rem .9rem;border-radius:10px;background:#111827;color:#fff;text-decoration:none;font-weight:700;`;

export function BalcaoPage() {
  const { funcionario } = useFuncionarioAuth();
  const pedidos = usePedidoStore((state) => state.pedidos);
  const ativos = useMemo(() => pedidos.filter((p) => !['entregue','cancelado'].includes(p.status)), [pedidos]);

  return (
    <PainelLayout icone="🧾" titulo="Painel do Balcão">
      <section>
        <h2 style={{marginTop:0}}>Olá, {funcionario?.nome}!</h2>
        <p>Acompanhe os pedidos e veja em tempo real quando a cozinha inicia e conclui o preparo.</p>
      </section>
      <Lista>
        {ativos.length === 0 ? <Card>Nenhum pedido em andamento.</Card> : ativos.map((pedido) => (
          <Card key={pedido.id}>
            <strong>#{pedido.id.slice(0,8).toUpperCase()}</strong>
            <h3>{pedido.dados.cliente.nome}</h3>
            <Status>{pedido.status === 'recebido' ? 'Na fila' : STATUS_PEDIDO_LABEL[pedido.status]}</Status>
            <p>{pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</p>
            <Botao to={`/pedido/${pedido.id}`}>Acompanhar pedido</Botao>
          </Card>
        ))}
      </Lista>
    </PainelLayout>
  );
}
