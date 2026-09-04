import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { buscarFilaCozinha, atualizarStatusPedido } from '../../pizzaria/api/pedido.service';
import type { Pedido } from '../../../store/pedido.store';

const Cartao = styled.div`background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 4px 16px rgba(15,23,42,.06);margin-bottom:1rem;`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;`;
const Botao = styled.button`border:0;border-radius:10px;padding:.7rem 1rem;cursor:pointer;font-weight:600;margin-right:.5rem;`;
const Item = styled.div`padding:.35rem 0;border-bottom:1px solid #eee;`;

export function CozinhaPage() {
  const { funcionario } = useFuncionarioAuth(); const [pedidos,setPedidos]=useState<Pedido[]>([]); const [erro,setErro]=useState('');
  const carregar=useCallback(async()=>{try{setPedidos(await buscarFilaCozinha());setErro('')}catch(e){setErro(e instanceof Error?e.message:'Falha ao carregar fila.')}},[]);
  useEffect(()=>{void carregar();const t=window.setInterval(()=>void carregar(),4000);return()=>window.clearInterval(t)},[carregar]);
  async function mudar(id:string,status:'em_preparo'|'aguardando_envio'){try{await atualizarStatusPedido(id,status);await carregar()}catch(e){setErro(e instanceof Error?e.message:'Falha ao atualizar pedido.')}}
  return <PainelLayout icone="🍕" titulo="Painel da Cozinha"><Cartao><h2>Olá, {funcionario?.nome}!</h2><p>Pedidos recebidos do site, balcão e atendimento.</p>{erro&&<p>{erro}</p>}</Cartao><Grid>{pedidos.map(p=><Cartao key={p.id}><strong>#{p.id.slice(0,8).toUpperCase()}</strong><p>{p.dados.cliente.nome} · {p.origem}</p>{p.itens.map(i=><Item key={i.id}>{i.quantidade}x {i.nome}</Item>)}<p><b>R$ {p.total.toFixed(2)}</b></p>{p.status==='recebido'?<Botao onClick={()=>void mudar(p.id,'em_preparo')}>Iniciar preparo</Botao>:<Botao onClick={()=>void mudar(p.id,'aguardando_envio')}>Concluir pedido</Botao>}</Cartao>)}</Grid>{pedidos.length===0&&<Cartao><p>Nenhum pedido aguardando preparo.</p></Cartao>}</PainelLayout>;
}
