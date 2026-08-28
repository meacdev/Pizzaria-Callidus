import { create } from 'zustand';
import type { Customization } from '../features/admin/types/customization';
import { getCustomization, saveCustomization } from '../features/admin/api/customization.service';

interface CustomizationState {
    customization: Customization;
    updateCustomization: (data: Customization) => void;
}

export const useCustomizationStore = create<CustomizationState>((set) => ({
    customization: getCustomization(),
    updateCustomization: (data) => {
        saveCustomization(data);
        set({ customization: data });
    },
}));