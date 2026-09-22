/**
 * @file cupom.service.ts
 * @brief Serviço de leitura/gravação dos cupons de desconto da loja no localStorage.
 *
 * @details
 * Mesmo padrão de @see customization.service.ts: guarda a lista de cupons
 * sob a chave `pizzaria_cupons`, caindo para @see CUPONS_PADRAO quando não
 * há nada salvo ou os dados estão corrompidos.
 */
import { CUPONS_PADRAO, type Cupom } from '../types/cupom';

const STORAGE_KEY = 'pizzaria_cupons';

/**
 * @brief Lê os cupons salvos da loja.
 * @return A lista de cupons salva, ou os cupons de exemplo (@see CUPONS_PADRAO) se nada estiver salvo ou os dados estiverem corrompidos.
 */
export function getCupons(): Cupom[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...CUPONS_PADRAO];
    try {
        const dados = JSON.parse(raw);
        return Array.isArray(dados) ? dados : [...CUPONS_PADRAO];
    } catch {
        return [...CUPONS_PADRAO];
    }
}

/**
 * @brief Salva a lista de cupons da loja.
 * @param cupons Lista completa de cupons a ser persistida.
 */
export function saveCupons(cupons: readonly Cupom[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cupons));
}
