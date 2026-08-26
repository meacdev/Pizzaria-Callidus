import { createContext, useContext, type ReactNode } from 'react';
import { useCustomizationStore } from './customization.store';
import type { Customization } from '../features/admin/types/customization';

interface CustomizationContextType {
    customization: Customization;
    updateCustomization: (data: Customization) => void;
}

const CustomizationContext = createContext<CustomizationContextType | null>(null);

export function CustomizationProvider({ children }: { children: ReactNode }) {
    const customization = useCustomizationStore((state) => state.customization);
    const updateCustomization = useCustomizationStore((state) => state.updateCustomization);

    return (
        <CustomizationContext.Provider value={{ customization, updateCustomization }}>
            {children}
        </CustomizationContext.Provider>
    );
}

export function useCustomization() {
    const ctx = useContext(CustomizationContext);
    if (!ctx) throw new Error('useCustomization precisa estar dentro de CustomizationProvider');
    return ctx;
}