import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CarrinhoState {
  readonly itens: readonly string[];
  readonly alternarCarrinho: (Id: string) => void;
  readonly estaNosCarrinho: (Id: string) => boolean;
  readonly limparCarrinho: () => void;
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set, get) => ({
      itens: [],
      alternarCarrinho: (Id) => {
        const atuais = get().itens;
        const existe = atuais.includes(Id);
        set({
          itens: existe
            ? atuais.filter((id) => id !== Id)
            : [...atuais, Id],
        });
      },
      estaNosCarrinho: (Id) => get().itens.includes(Id),
      limparCarrinho: () => set({ itens: [] }),
    }),
    { name: 'pizzaria-carrinho' },
  ),
);
