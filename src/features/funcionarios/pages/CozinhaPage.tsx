import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { listarPedidos, atualizarStatusPedidoApi, type PedidoApi } from '../../pizzaria/api/pedido.service';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
`;

const Cabecalho = styled.div`
    padding: 1.75rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    background: linear-gradient(145deg, #281410, rgba(58, 28, 21, 0.82));
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
`;

const Titulo = styled.h2`
    margin: 0;
    font-size: clamp(1.45rem, 2.5vw, 2rem);
    color: #fff;
    letter-spacing: -0.02em;
`;

const Descricao = styled.p`
    margin: 0.55rem 0 0;
    color: #d7c9c4;
    line-height: 1.55;
    max-width: 850px;
`;

const Erro = styled.p`
    margin: 1rem 0 0;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(230, 0, 0, 0.3);
    border-radius: 12px;
    background: rgba(230, 0, 0, 0.09);
    color: #ffb0b0;
`;

const Resumo = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
    margin-top: 1.35rem;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
`;

const Indicador = styled.div`
    min-height: 105px;
    padding: 1.15rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.13);
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const IndicadorLabel = styled.span`
    color: #d7c9c4;
    font-size: 0.86rem;
    font-weight: 700;
`;

const IndicadorValor = styled.strong`
    margin-top: 0.35rem;
    font-size: 2rem;
    line-height: 1;
    color: #fff;
`;

const Secao = styled.section`
    min-width: 0;
`;

const CabecalhoSecao = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;

    h2 {
        margin: 0;
        font-size: 1.35rem;
        color: #fff;
    }

    span {
        color: #d7c9c4;
        font-size: 0.88rem;
    }

    @media (max-width: 600px) {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.3rem;
    }
`;

const Lista = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
`;

const Card = styled.article`
    min-width: 0;
    padding: 1.15rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: #281410;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 42, 42, 0.35);
        box-shadow: 0 15px 32px rgba(0, 0, 0, 0.28);
    }
`;

const Topo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    strong {
        font-size: 0.98rem;
        color: #fff;
    }
`;

const Status = styled.span<{ $status: string }>`
    flex-shrink: 0;
    padding: 0.38rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    white-space: nowrap;
    background: ${({ $status }) => $status === 'recebido' ? 'rgba(255, 199, 44, 0.14)' : $status === 'em_preparo' ? 'rgba(66, 153, 225, 0.15)' : 'rgba(42, 200, 110, 0.13)'};
    color: ${({ $status }) => $status === 'recebido' ? '#ffd86a' : $status === 'em_preparo' ? '#8fc9ff' : '#8df0b5'};
    border: 1px solid ${({ $status }) => $status === 'recebido' ? 'rgba(255, 199, 44, 0.25)' : $status === 'em_preparo' ? 'rgba(66, 153, 225, 0.25)' : 'rgba(42, 200, 110, 0.25)'};
`;

const Info = styled.p`
    margin: 0.95rem 0 0;
    color: #d7c9c4;
    line-height: 1.5;
    font-size: 0.9rem;

    strong {
        color: #fff;
    }
`;

const Itens = styled.ul`
    margin: 0.9rem 0;
    padding: 0.8rem 0 0.8rem 1.25rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.12);
    border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    color: #d7c9c4;
    line-height: 1.7;
    font-size: 0.88rem;
`;

const Total = styled.p`
    margin: 0;
    color: #fff;
    font-size: 1rem;
    font-weight: 800;
`;

const Acoes = styled.div`
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-top: 1rem;
`;

const Botao = styled.button`
    min-height: 42px;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.68rem 0.95rem;
    font-weight: 800;
    background: #ff2a2a;
    color: #fff;
    transition: transform 0.15s ease, background 0.15s ease, opacity 0.15s ease;

    &:hover:not(:disabled) {
        background: #ff5c5c;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const BotaoSecundario = styled(Botao)`
    background: #3a1c15;
    color: #fff;
    border-color: rgba(255, 255, 255, 0.12);

    &:hover:not(:disabled) {
        background: #47231a;
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const Vazio = styled.div`
    min-height: 86px;
    padding: 1.4rem;
    display: grid;
    place-items: center;
    color: #d7c9c4;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    text-align: center;
    background: rgba(0, 0, 0, 0.08);
`;

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
    <PainelLayout icone="🍕" titulo="Painel da Cozinha" tema="escuro">
      <Container>
        <Cabecalho>
          <Titulo>Olá, {funcionario?.nome}!</Titulo>
          <Descricao>Gerencie a produção. Quando um pedido for concluído, ele ficará automaticamente disponível no painel do entregador.</Descricao>
          {erro && <Erro role="alert"><strong>Erro:</strong> {erro}</Erro>}
          <Resumo>
            <Indicador><IndicadorLabel>Na fila</IndicadorLabel><IndicadorValor>{pedidos.filter(p=>p.status==='recebido').length}</IndicadorValor></Indicador>
            <Indicador><IndicadorLabel>Em preparo</IndicadorLabel><IndicadorValor>{pedidos.filter(p=>p.status==='em_preparo').length}</IndicadorValor></Indicador>
            <Indicador><IndicadorLabel>Concluídos / aguardando envio</IndicadorLabel><IndicadorValor>{concluidos.length}</IndicadorValor></Indicador>
          </Resumo>
        </Cabecalho>

        <Secao>
          <CabecalhoSecao><h2>Fila de produção</h2><span>{fila.length} pedido(s) em produção</span></CabecalhoSecao>
          {fila.length === 0 ? <Vazio>Nenhum pedido aguardando preparo.</Vazio> : <Lista>{fila.map((pedido) => (
            <Card key={pedido.pedidoId}>
              <Topo><strong>#{idCurto(pedido.pedidoId)}</strong><Status $status={pedido.status}>{pedido.status === 'recebido' ? 'Na fila' : 'Em preparo'}</Status></Topo>
              <Info><strong>{pedido.cliente.nome}</strong><br />Recebido em {formatarData(pedido.criadoEm)}</Info>
              <Itens>{pedido.itens.map((item) => <li key={item.id}>{item.quantidade}x {item.nome}</li>)}</Itens>
              {pedido.observacoes && <Info><strong>Observações:</strong> {pedido.observacoes}</Info>}
              <Total>Total: {formatarPreco(pedido.total)}</Total>
              <Acoes>
                {pedido.status === 'recebido' && <Botao onClick={() => void alterarStatus(pedido.pedidoId, 'em_preparo')}>Iniciar preparo</Botao>}
                {pedido.status === 'em_preparo' && <Botao onClick={() => void alterarStatus(pedido.pedidoId, 'pronto')}>Concluir preparo</Botao>}
              </Acoes>
            </Card>
          ))}</Lista>}
        </Secao>

        <Secao>
          <CabecalhoSecao><h2>Concluídos / aguardando envio</h2><span>Prontos para o entregador</span></CabecalhoSecao>
          {concluidos.length === 0 ? <Vazio>Nenhum pedido concluído aguardando envio.</Vazio> : <Lista>{concluidos.map((pedido) => (
            <Card key={pedido.pedidoId}>
              <Topo><strong>#{idCurto(pedido.pedidoId)}</strong><Status $status="pronto">Concluído / aguardando envio</Status></Topo>
              <Info><strong>{pedido.cliente.nome}</strong><br />Concluído em {formatarData(pedido.atualizadoEm)}</Info>
              <Itens>{pedido.itens.map((item) => <li key={item.id}>{item.quantidade}x {item.nome}</li>)}</Itens>
              <Acoes><BotaoSecundario onClick={() => void alterarStatus(pedido.pedidoId, 'em_preparo')}>Voltar para preparo</BotaoSecundario></Acoes>
            </Card>
          ))}</Lista>}
        </Secao>
      </Container>
    </PainelLayout>
  );
}
