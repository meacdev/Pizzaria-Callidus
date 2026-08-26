import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CarrinhoState {
  readonly itens: Readonly<Record<string, number>>;
  readonly alternarCarrinho: (id: string) => void;
  readonly aumentarQuantidade: (id: string) => void;
  readonly diminuirQuantidade: (id: string) => void;
  readonly removerItem: (id: string) => void;
  readonly obterQuantidade: (id: string) => number;
  readonly estaNosCarrinho: (id: string) => boolean;
  readonly limparCarrinho: () => void;
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set, get) => ({
      itens: {},

      alternarCarrinho: (id) => {
        const atuais = get().itens;
        if (atuais[id]) {
          const { [id]: _removido, ...resto } = atuais;
          set({ itens: resto });
        } else {
          set({ itens: { ...atuais, [id]: 1 } });
        }
      },

      aumentarQuantidade: (id) => {
        const atuais = get().itens;
        const quantidadeAtual = atuais[id] ?? 0;
        set({ itens: { ...atuais, [id]: quantidadeAtual + 1 } });
      },

      diminuirQuantidade: (id) => {
        const atuais = get().itens;
        const quantidadeAtual = atuais[id] ?? 0;
        if (quantidadeAtual <= 1) {
          const { [id]: _removido, ...resto } = atuais;
          set({ itens: resto });
          return;
        }
        set({ itens: { ...atuais, [id]: quantidadeAtual - 1 } });
      },

      removerItem: (id) => {
        const atuais = get().itens;
        const { [id]: _removido, ...resto } = atuais;
        set({ itens: resto });
      },

      obterQuantidade: (id) => get().itens[id] ?? 0,

      estaNosCarrinho: (id) => Boolean(get().itens[id]),

      limparCarrinho: () => set({ itens: {} }),
    }),
    {
      name: 'pizzaria-carrinho',
      version: 1,
      migrate: (estadoPersistido) => {
        const estado = estadoPersistido as { itens?: unknown };
        if (Array.isArray(estado?.itens)) {
          const itens: Record<string, number> = {};
          for (const id of estado.itens as string[]) {
            itens[id] = (itens[id] ?? 0) + 1;
          }
          return { ...estado, itens };
        }
        return estado as CarrinhoState;
      },
    },
  ),
);
