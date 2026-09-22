/**
 * @file CustomizationContext.tsx
 * @brief Contexto React que expõe a customização visual da loja (cores) e a função para atualizá-la.
 *
 * @details
 * É uma camada fina sobre @see customization.store — delega o estado e a
 * persistência à store do zustand e só expõe o valor/setter via contexto.
 * Consumido por @see providers.tsx (`TemaDinamico`) para aplicar as cores
 * como variáveis CSS.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useCustomizationStore } from './customization.store';
import type { Customization } from '../features/admin/types/customization';

/** @brief Formato do valor exposto pelo @see CustomizationContext. */
interface CustomizationContextType {
    customization: Customization;
    updateCustomization: (data: Customization) => void;
}

const CustomizationContext = createContext<CustomizationContextType | null>(null);

/** @brief Provedor do contexto de customização da loja, alimentado pela @see useCustomizationStore. */
export function CustomizationProvider({ children }: { children: ReactNode }) {
    const customization = useCustomizationStore((state) => state.customization);
    const updateCustomization = useCustomizationStore((state) => state.updateCustomization);

    return (
        <CustomizationContext.Provider value={{ customization, updateCustomization }}>
            {children}
        </CustomizationContext.Provider>
    );
}

/**
 * @brief Hook de acesso à customização visual da loja.
 * @return A customização atual e a função `updateCustomization` para alterá-la.
 */
export function useCustomization() {
    const ctx = useContext(CustomizationContext);
    if (!ctx) throw new Error('useCustomization precisa estar dentro de CustomizationProvider');
    return ctx;
}