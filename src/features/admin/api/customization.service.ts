import { CUSTOMIZATION_PADRAO, type Customization } from '../types/customization';
const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export async function getCustomization(): Promise<Customization> {
  try {
    const r = await fetch(`${API_BASE}/configuracao`);
    if (!r.ok) throw new Error();
    return { ...CUSTOMIZATION_PADRAO, ...(await r.json()) };
  } catch {
    return CUSTOMIZATION_PADRAO;
  }
}
export async function saveCustomization(data: Customization): Promise<void> {
  const r = await fetch(`${API_BASE}/configuracao`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!r.ok) throw new Error('Não foi possível salvar a configuração.');
}
