import { CUSTOMIZATION_PADRAO, type Customization } from '../types/customization';

const STORAGE_KEY = 'pizzaria_customization';

export function getCustomization(): Customization {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return CUSTOMIZATION_PADRAO;
    try {
        return { ...CUSTOMIZATION_PADRAO, ...JSON.parse(raw) };
    } catch {
        return CUSTOMIZATION_PADRAO;
    }
}

export function saveCustomization(data: Customization): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}