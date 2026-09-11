/**
 * @file customization.service.ts
 * @brief Serviço de leitura/gravação da customização da loja no localStorage.
 *
 * @details
 * Guarda as preferências visuais e de funcionamento do lojista (@see
 * Customization) sob a chave `pizzaria_customization`, aplicando o padrão
 * (@see CUSTOMIZATION_PADRAO) quando não há dados salvos ou eles estão
 * corrompidos.
 */
import { CUSTOMIZATION_PADRAO, type Customization } from '../types/customization';

const STORAGE_KEY = 'pizzaria_customization';

/**
 * @brief Lê a customização salva da loja.
 * @return A customização salva mesclada com o padrão, ou o padrão puro se nada estiver salvo ou os dados estiverem corrompidos.
 */
export function getCustomization(): Customization {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return CUSTOMIZATION_PADRAO;
    try {
        return { ...CUSTOMIZATION_PADRAO, ...JSON.parse(raw) };
    } catch {
        return CUSTOMIZATION_PADRAO;
    }
}

/**
 * @brief Salva a customização da loja.
 * @param data Customização completa a ser persistida.
 */
export function saveCustomization(data: Customization): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}