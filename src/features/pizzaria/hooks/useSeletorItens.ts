import { useMemo, useState } from 'react';

/**
 * Hook compartilhado para montar um pedido "rápido" a partir do cardápio
 * (pizza, bebida ou combo + quantidade), sem a personalização completa de
 * pizza (tamanho/ingredientes/borda) do carrinho do site. Usado tanto pelo
 * totem de autoatendimento quanto pelo formulário de "novo pedido" do
 * garçom no balcão.
 */
export interface ItemSelecionavel {
  readonly chave: string;
  readonly tipo: 'pizza' | 'bebida' | 'combo';
  readonly id: string;
  readonly nome: string;
  readonly precoUnitario: number;
}

export interface ItemSelecionado extends ItemSelecionavel {
  readonly quantidade: number;
}

function semAChave(mapa: Record<string, ItemSelecionado>, chave: string): Record<string, ItemSelecionado> {
  const resto: Record<string, ItemSelecionado> = {};
  for (const chaveAtual of Object.keys(mapa)) {
    if (chaveAtual !== chave) resto[chaveAtual] = mapa[chaveAtual];
  }
  return resto;
}

export function useSeletorItens() {
  const [itensPorChave, setItensPorChave] = useState<Record<string, ItemSelecionado>>({});

  function adicionar(item: ItemSelecionavel, quantidade = 1) {
    setItensPorChave((atuais) => {
      const existente = atuais[item.chave];
      return {
        ...atuais,
        [item.chave]: {
          ...item,
          quantidade: (existente?.quantidade ?? 0) + quantidade,
        },
      };
    });
  }

  function remover(chave: string) {
    setItensPorChave((atuais) => {
      const existente = atuais[chave];
      if (!existente) return atuais;

      if (existente.quantidade <= 1) {
        return semAChave(atuais, chave);
      }

      return { ...atuais, [chave]: { ...existente, quantidade: existente.quantidade - 1 } };
    });
  }

  function removerTudo(chave: string) {
    setItensPorChave((atuais) => semAChave(atuais, chave));
  }

  function definirQuantidade(chave: string, quantidade: number) {
    setItensPorChave((atuais) => {
      const existente = atuais[chave];
      if (!existente) return atuais;

      if (quantidade <= 0) {
        return semAChave(atuais, chave);
      }

      return { ...atuais, [chave]: { ...existente, quantidade } };
    });
  }

  function limpar() {
    setItensPorChave({});
  }

  const itens = useMemo(() => Object.values(itensPorChave), [itensPorChave]);

  const quantidadeTotal = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens],
  );

  const total = useMemo(
    () => Number(itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0).toFixed(2)),
    [itens],
  );

  return { itens, quantidadeTotal, total, adicionar, remover, removerTudo, definirQuantidade, limpar };
}
