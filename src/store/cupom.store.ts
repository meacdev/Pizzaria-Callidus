/**
 * @file cupom.store.ts
 * @brief Store (zustand) com os cupons de desconto configuráveis da loja.
 *
 * @details
 * Mesmo padrão de @see customization.store.ts: a lista inicial vem de
 * `getCupons` e cada mudança (criar, editar, remover) é persistida via
 * `saveCupons` (@see cupom.service). Consumida pelo carrossel público
 * (@see CarrosselCupons), pela página /cupons (@see CuponsPage) e pelo
 * editor no painel de customização (@see CampoCupons).
 */
import { create } from 'zustand';
import type { Cupom } from '../features/cupons/types/cupom';
import { getCupons, saveCupons } from '../features/cupons/api/cupom.service';

/** @brief Estado da store de cupons de desconto da loja. */
interface CupomState {
    cupons: Cupom[];
    /** @brief Substitui a lista inteira de cupons (usado pelo editor de customização). */
    definirCupons: (cupons: Cupom[]) => void;
    /** @brief Adiciona um novo cupom ao fim da lista. */
    adicionarCupom: (cupom: Cupom) => void;
    /** @brief Atualiza um cupom existente pelo id. */
    atualizarCupom: (cupom: Cupom) => void;
    /** @brief Remove um cupom pelo id. */
    removerCupom: (id: string) => void;
}

/** @brief Store zustand com os cupons de desconto da loja, persistidos a cada mudança. */
export const useCupomStore = create<CupomState>((set) => ({
    cupons: getCupons(),

    definirCupons: (cupons) => {
        saveCupons(cupons);
        set({ cupons });
    },

    adicionarCupom: (cupom) =>
        set((estado) => {
            const cupons = [...estado.cupons, cupom];
            saveCupons(cupons);
            return { cupons };
        }),

    atualizarCupom: (cupom) =>
        set((estado) => {
            const cupons = estado.cupons.map((c) => (c.id === cupom.id ? cupom : c));
            saveCupons(cupons);
            return { cupons };
        }),

    removerCupom: (id) =>
        set((estado) => {
            const cupons = estado.cupons.filter((c) => c.id !== id);
            saveCupons(cupons);
            return { cupons };
        }),
}));
