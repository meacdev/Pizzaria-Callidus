import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { atualizarStatusPedido, listarPedidos } from '../../pizzaria/api/pedido.service';
import type { Pedido, StatusPedido } from '../../../store/pedido.store';

const Cartao = styled.article`background:#fff;border-radius:16px;padding:1.25rem;box-shadow:0 4px 16px rgba(15,23,42,.06);`;
const Grade = styled.div`display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));`;
const Acoes = styled.div`display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem;`;

const origemLabel: Record<string, string> = { site: 'Site', balcao: 'Balcão', garcom: 'Garçom', atendente: 'Atendente' };
const statusLabel: Record<StatusPedido, string> = { recebido: 'Recebido', em_preparo: 'Em preparo', pronto: 'Pronto', saiu_para_entrega: 'Saiu para entrega', entregue: 'Entregue', cancelado: 'Cancelado' };

export function CozinhaPage() {
  const { funcionario } = useFuncionarioAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try { setPedidos(await listarPedidos()); setErro(''); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao carregar pedidos.'); }
  }, []);

  useEffect(() => { void carregar(); const id = window.setInterval(() => void carregar(), 3000); return () => window.clearInterval(id); }, [carregar]);

  async function mudarStatus(id: string, status: StatusPedido) {
    try { const atualizado = await atualizarStatusPedido(id, status); setPedidos((atual) => atual.map((p) => p.id === id ? atualizado : p)); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao atualizar pedido.'); }
  }

  const fila = pedidos.filter((p) => ['recebido', 'em_preparo'].includes(p.status));

  return <PainelLayout icone="🍕" titulo="Painel da Cozinha">
    <p>Olá, {funcionario?.nome}. Pedidos do <strong>site, balcão, garçom e atendente</strong> aparecem aqui automaticamente.</p>
    {erro && <p role="alert">{erro}</p>}
    <p><strong>{fila.length}</strong> pedido(s) aguardando preparo.</p>
    <Grade>
      {fila.map((pedido) => <Cartao key={pedido.id}>
        <h2>Pedido #{pedido.id}</h2>
        <p><strong>Origem:</strong> {origemLabel[pedido.origem] ?? pedido.origem}</p>
        <p><strong>Cliente:</strong> {pedido.dados.nome}</p>
        <p><strong>Status:</strong> {statusLabel[pedido.status]}</p>
        <ul>{pedido.itens.map((item) => <li key={`${pedido.id}-${item.id}`}>{item.quantidade}x {item.nome}</li>)}</ul>
        {pedido.observacoes && <p><strong>Observações:</strong> {pedido.observacoes}</p>}
        <p><strong>Total:</strong> {pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <Acoes>
          {pedido.status === 'recebido' && <button type="button" onClick={() => void mudarStatus(pedido.id, 'em_preparo')}>Iniciar preparo</button>}
          {pedido.status === 'em_preparo' && <button type="button" onClick={() => void mudarStatus(pedido.id, 'pronto')}>Marcar como pronto</button>}
          <button type="button" onClick={() => void mudarStatus(pedido.id, 'cancelado')}>Cancelar</button>
        </Acoes>
      </Cartao>)}
    </Grade>
    {fila.length === 0 && <Cartao><p>Nenhum pedido aguardando preparo.</p></Cartao>}
  </PainelLayout>;
}
