/**
 * @file DestaquePizzaMaisVendida.tsx
 * @brief Seção de destaque, no início da home, com a pizza mais vendida da loja.
 *
 * @details
 * Busca o nome da pizza mais vendida no relatório de vendas (@see
 * relatorio.service — a mesma rota pública usada pelo painel gerencial,
 * @see GerentePage), sem filtro de data (todo o histórico), e casa esse
 * nome com a pizza correspondente na lista já carregada pela home (@see
 * usePizzas). Não renderiza nada enquanto carrega, se a busca falhar, ou
 * se ainda não houve nenhuma venda — a home nunca fica bloqueada por essa
 * seção opcional.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Pizza } from '../types/pizza';
import { buscarRelatorioVendas } from '../../admin/api/relatorio.service';
import { nomeCategoria } from '../utils/pizza.utils';

/** @brief Props do componente {@link DestaquePizzaMaisVendida}. */
interface DestaquePizzaMaisVendidaProps {
  /** Lista de pizzas já carregada pela home, usada para casar com o nome vindo do relatório. */
  readonly pizzas: readonly Pizza[];
}

/** @brief Normaliza um nome de pizza (minúsculo, sem espaços nas pontas) para comparação. */
function normalizar(nome: string): string {
  return nome.trim().toLowerCase();
}

/** @brief Seção de destaque com a pizza mais vendida da loja (todo o histórico), com link para o pedido. */
export function DestaquePizzaMaisVendida({ pizzas }: DestaquePizzaMaisVendidaProps) {
  const [nomeMaisVendida, setNomeMaisVendida] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(0);

  useEffect(() => {
    let cancelado = false;

    buscarRelatorioVendas(new Date(0), new Date())
      .then((relatorio) => {
        if (cancelado || !relatorio.maisVendidoPizza) return;
        setNomeMaisVendida(relatorio.maisVendidoPizza.nome);
        setQuantidade(relatorio.maisVendidoPizza.quantidade);
      })
      .catch(() => {
        // Sem relatório disponível (ex.: backend fora do ar) — a seção simplesmente não aparece.
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (!nomeMaisVendida) return null;

  const pizza = pizzas.find((item) => normalizar(item.nome) === normalizar(nomeMaisVendida));
  if (!pizza) return null;

  return (
    <section className="principal destaque-mais-vendida">
      <Link to={`/pizza/${pizza.slug}`} className="destaque-mais-vendida-link">
        <div className="destaque-mais-vendida-imagem">
          <img src={pizza.imgURL} alt={`Capa da pizza ${pizza.nome}`} loading="lazy" />
        </div>
        <div className="destaque-mais-vendida-conteudo">
          <span className="tag">🏆 A mais pedida da casa</span>
          <h2>{pizza.nome}</h2>
          <p className="categoria">{nomeCategoria(pizza.categoria)}</p>
          <p className="descricao-card">{pizza.descricao}</p>
          <span className="destaque-mais-vendida-quantidade">
            {quantidade} unidade(s) vendida(s)
          </span>
          <span className="link-leia-mais">Ver detalhes e pedir →</span>
        </div>
      </Link>
    </section>
  );
}
