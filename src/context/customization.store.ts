import { create } from 'zustand';
import type { Customization } from '../features/admin/types/customization';
import { CUSTOMIZATION_PADRAO } from '../features/admin/types/customization';
import { getCustomization, saveCustomization } from '../features/admin/api/customization.service';

interface CustomizationState {
  customization: Customization;
  carregando: boolean;
  carregar: () => Promise<void>;
  updateCustomization: (data: Customization) => Promise<void>;
}
export const useCustomizationStore = create<CustomizationState>((set) => ({
  customization: CUSTOMIZATION_PADRAO,
  carregando: true,
  carregar: async () => { const data = await getCustomization(); set({ customization: data, carregando: false }); },
  updateCustomization: async (data) => { await saveCustomization(data); set({ customization: data }); },
}));
