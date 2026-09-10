import { create } from 'zustand';
import { Comanda, Mesa } from '../features/pizzaria/types/pedido';

interface PedidoStore {
  mesas: Mesa[];
  comandas: Comanda[];
  abrirComanda: (mesaId: number, nomeCliente: string, itens: any[], total: number) => void;
  pagarComanda: (comandaId: string) => void;
  finalizarMesa: (mesaId: number) => boolean;
}

export const usePedidoStore = create<PedidoStore>((set, get) => ({
  mesas: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, status: 'LIVRE' })),
  comandas: [],
  
  abrirComanda: (mesaId, nomeCliente, itens, total) => {
    const novaComanda: Comanda = {
      id: Math.random().toString(36).substring(2, 9),
      mesaId,
      nomeCliente,
      itens,
      total,
      status: 'ABERTA',
    };
    
    set((state) => ({
      comandas: [...state.comandas, novaComanda],
      mesas: state.mesas.map(m => m.id === mesaId ? { ...m, status: 'OCUPADA' } : m)
    }));
  },
  
  pagarComanda: (comandaId) => {
    set((state) => ({
      comandas: state.comandas.map(c => c.id === comandaId ? { ...c, status: 'PAGA' } : c)
    }));
  },
  
  finalizarMesa: (mesaId) => {
    const { comandas } = get();
    const comandasDaMesa = comandas.filter(c => c.mesaId === mesaId);
    
    // Verifica se TODAS as comandas da mesa estão pagas
    const todasPagas = comandasDaMesa.every(c => c.status === 'PAGA');
    
    if (todasPagas && comandasDaMesa.length > 0) {
      set((state) => ({
        // Arquiva/Remove as comandas da mesa atual
        comandas: state.comandas.filter(c => c.mesaId !== mesaId),
        // Libera a mesa
        mesas: state.mesas.map(m => m.id === mesaId ? { ...m, status: 'LIVRE' } : m)
      }));
      return true;
    }
    return false;
  }
}));
