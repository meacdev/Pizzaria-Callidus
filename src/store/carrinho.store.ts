import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemCarrinho } from '../features/pizzaria/types/itemCarrinho';

interface CarrinhoState {
  readonly itens: readonly ItemCarrinho[];

  readonly adicionarAoCarrinho: (
    item: ItemCarrinho,
  ) => void;

  readonly aumentarQuantidade: (
    id: string,
  ) => void;

  readonly diminuirQuantidade: (
    id: string,
  ) => void;

  readonly removerItem: (
    id: string,
  ) => void;

  readonly obterQuantidade: (
    id: string,
  ) => number;

  readonly estaNosCarrinho: (
    id: string,
  ) => boolean;

  readonly limparCarrinho: () => void;
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set, get) => ({

      itens: [],

      adicionarAoCarrinho: (novoItem) => {
        const atuais = get().itens;

        const itemExistente = atuais.find(
          (item) => item.id === novoItem.id,
        );

        if (itemExistente) {
          set({
            itens: atuais.map((item) =>
              item.id === novoItem.id
                ? {
                    ...item,
                    quantidade:
                      item.quantidade +
                      novoItem.quantidade,
                  }
                : item,
            ),
          });

          return;
        }

        set({
          itens: [
            ...atuais,
            novoItem,
          ],
        });
      },

      aumentarQuantidade: (id) => {
        set((state) => ({
          itens: state.itens.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantidade: item.quantidade + 1,
                }
              : item,
          ),
        }));
      },

      diminuirQuantidade: (id) => {
        set((state) => ({
          itens: state.itens
            .map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantidade: item.quantidade - 1,
                  }
                : item,
            )
            .filter(
              (item) => item.quantidade > 0,
            ),
        }));
      },

      removerItem: (id) => {
        set((state) => ({
          itens: state.itens.filter(
            (item) => item.id !== id,
          ),
        }));
      },

      obterQuantidade: (id) => {
        return get().itens
          .filter((item) => {

            if (item.tipo === 'pizza') {
              return item.pizza.id === id;
            }

            if (item.tipo === 'bebida') {
              return String(item.bebida.id) === id;
            }

            return item.combo.id === id;
          })
          .reduce(
            (total, item) =>
              total + item.quantidade,
            0,
          );
      },

      estaNosCarrinho: (id) => {
        return get().itens.some((item) => {

          if (item.tipo === 'pizza') {
            return item.pizza.id === id;
          }

          if (item.tipo === 'bebida') {
            return String(item.bebida.id) === id;
          }

          return item.combo.id === id;
        });
      },

      limparCarrinho: () => {
        set({
          itens: [],
        });
      },

    }),

    {
      name: 'pizzaria-carrinho',
    },
  ),
);