import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useCustomizationStore } from './customization.store';
import type { Customization } from '../features/admin/types/customization';
interface CustomizationContextType { customization: Customization; updateCustomization: (data: Customization) => Promise<void>; }
const CustomizationContext = createContext<CustomizationContextType | null>(null);
export function CustomizationProvider({ children }: { children: ReactNode }) {
  const customization=useCustomizationStore(s=>s.customization); const carregar=useCustomizationStore(s=>s.carregar); const updateCustomization=useCustomizationStore(s=>s.updateCustomization);
  useEffect(()=>{void carregar()},[carregar]);
  return <CustomizationContext.Provider value={{customization,updateCustomization}}>{children}</CustomizationContext.Provider>;
}
export function useCustomization(){const ctx=useContext(CustomizationContext);if(!ctx)throw new Error('useCustomization precisa estar dentro de CustomizationProvider');return ctx;}
