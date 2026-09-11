/**
 * @file customization.store.ts
 * @brief Store (zustand) com a customização visual (cores) da loja.
 *
 * @details
 * Fonte de verdade para @see CustomizationContext; a customização inicial
 * vem de `getCustomization` e cada atualização é persistida via
 * `saveCustomization` (@see customization.service).
 */
import { create } from 'zustand';
import type { Customization } from '../features/admin/types/customization';
import { getCustomization, saveCustomization } from '../features/admin/api/customization.service';

/** @brief Estado da store de customização visual da loja. */
interface CustomizationState {
    customization: Customization;
    updateCustomization: (data: Customization) => void;
}

/** @brief Store zustand com a customização da loja, persistida a cada atualização. */
export const useCustomizationStore = create<CustomizationState>((set) => ({
    customization: getCustomization(),
    updateCustomization: (data) => {
        saveCustomization(data);
        set({ customization: data });
    },
}));