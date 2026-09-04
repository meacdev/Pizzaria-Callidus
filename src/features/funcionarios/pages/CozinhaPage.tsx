import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { listarPedidos, atualizarStatusPedidoApi, type PedidoApi } from '../../pizzaria/api/pedido.service';

const Container = styled.div`display:flex;flex-direction:column;gap:1.25rem;`;
const Cabecalho = styled.div`background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 4px 16px rgba(15,23,42,.06);`;
const Resumo = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1rem;@media(max-width:700px){grid-template-columns:1fr;}`;
const Indicador = styled.div`padding:1rem;border:1px solid #e5e7eb;border-radius:12px;`;
const Lista = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:1rem;`;
const Card = styled.article`background:#fff;border-radius:16px;padding:1.25rem;box-shadow:0 4px 16px rgba(15,23,42,.06);border:1px solid #e5e7eb;`;
const Topo = styled.div`display:flex;justify-content:space-between;gap:1rem;align-items:center;`;
const Status = styled.span<{ $status: string }>`padding:.35rem .65rem;border-radius:999px;font-size:.8rem;font-weight:700;background:${({$status}) => $status === 'recebido' ? '#fef3c7' : $status === 'em_preparo' ? '#dbeafe' : '#dcfce7'};color:${({$status}) => $status === 'recebido' ? '#92400e' : $status === 'em_preparo' ? '#1e40af' : '#166534'};`;
const Itens = styled.ul`padding-left:1.2rem;line-height:1.7;color:#374151;`;
const Acoes = styled.div`display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem;`;
const Botao = styled.button`border:0;border-radius:10px;padding:.7rem 1rem;font-weight:700;cursor:pointer;background:#111827;color:#fff;&:disabled{opacity:.45;cursor:not-allowed;}`;
const BotaoSecundario = styled(Botao)`background:#e5e7eb;color:#111827;`;

function formatarData(data: string) { return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(data)); }
function formatarPreco(valor: number) { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(valor); }
function idCurto(id: string) { return id.slice(0, 8).toUpperCase(); }

export function CozinhaPage() {
  const { funcionario } = useFuncionarioAuth();
  const [pedidos, setPedidos] = useState<PedidoApi[]>([]);
  const [erro, setErro] = useState('');

  async function carregarPedidos() {
    try {
      setPedidos(await listarPedidos());
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os pedidos.');
    }
  }

  useEffect(() => {
    void carregarPedidos();
    const intervalo = window.setInterval(() => void carregarPedidos(), 5000);
    return () => window.clearInterval(intervalo);
  }, []);

  const fila = useMemo(() => pedidos.filter((p) => ['recebido','em_preparo'].includes(p.status)), [pedidos]);
  const concluidos = useMemo(() => pedidos.filter((p) => p.status === 'pronto'), [pedidos]);

  async function alterarStatus(id: string, status: string) {
    try {
      const atualizado = await atualizarStatusPedidoApi(id, status);
      setPedidos((atuais) => atuais.map((pedido) => pedido.pedidoId === id ? atualizado : pedido));
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível alterar o status.');
    }
  }

  return (
    <PainelLayout icone="🍕" titulo="Painel da Cozinha">
      <Container>
        <Cabecalho>
          <h2 style={{marginTop:0}}>Olá, {funcionario?.nome}!</h2>
          <p>Gerencie a produção. Quando um pedido for concluído, ele ficará automaticamente disponível no painel do entregador.</p>
          {erro && <p role="alert"><strong>Erro:</strong> {erro}</p>}
          <Resumo>
            <Indicador><strong>Na fila</strong><div style={{fontSize:'1.8rem'}}>{pedidos.filter(p=>p.status==='recebido').length}</div></Indicador>
            <Indicador><strong>Em preparo</strong><div style={{fontSize:'1.8rem'}}>{pedidos.filter(p=>p.status==='em_preparo').length}</div></Indicador>
            <Indicador><strong>Concluídos / aguardando envio</strong><div style={{fontSize:'1.8rem'}}>{concluidos.length}</div></Indicador>
          </Resumo>
        </Cabecalho>

        <section>
          <h2>Fila de produção</h2>
          {fila.length === 0 ? <Cabecalho>Nenhum pedido aguardando preparo.</Cabecalho> : <Lista>{fila.map((pedido) => (
            <Card key={pedido.pedidoId}>
              <Topo><strong>#{idCurto(pedido.pedidoId)}</strong><Status $status={pedido.status}>{pedido.status === 'recebido' ? 'Na fila' : 'Em preparo'}</Status></Topo>
              <p><strong>{pedido.cliente.nome}</strong><br />Recebido em {formatarData(pedido.criadoEm)}</p>
              <Itens>{pedido.itens.map((item) => <li key={item.id}>{item.quantidade}x {item.nome}</li>)}</Itens>
              {pedido.observacoes && <p><strong>Observações:</strong> {pedido.observacoes}</p>}
              <p><strong>Total:</strong> {formatarPreco(pedido.total)}</p>
              <Acoes>
                {pedido.status === 'recebido' && <Botao onClick={() => void alterarStatus(pedido.pedidoId, 'em_preparo')}>Iniciar preparo</Botao>}
                {pedido.status === 'em_preparo' && <Botao onClick={() => void alterarStatus(pedido.pedidoId, 'pronto')}>Concluir preparo</Botao>}
              </Acoes>
            </Card>
          ))}</Lista>}
        </section>

        <section>
          <h2>Concluídos / aguardando envio</h2>
          {concluidos.length === 0 ? <Cabecalho>Nenhum pedido concluído aguardando envio.</Cabecalho> : <Lista>{concluidos.map((pedido) => (
            <Card key={pedido.pedidoId}>
              <Topo><strong>#{idCurto(pedido.pedidoId)}</strong><Status $status="pronto">Concluído / aguardando envio</Status></Topo>
              <p><strong>{pedido.cliente.nome}</strong><br />Concluído em {formatarData(pedido.atualizadoEm)}</p>
              <Itens>{pedido.itens.map((item) => <li key={item.id}>{item.quantidade}x {item.nome}</li>)}</Itens>
              <Acoes><BotaoSecundario onClick={() => void alterarStatus(pedido.pedidoId, 'em_preparo')}>Voltar para preparo</BotaoSecundario></Acoes>
            </Card>
          ))}</Lista>}
        </section>
      </Container>
    </PainelLayout>
  );
}
