import React, { useState } from 'react';
import { usePedidoStore } from '../../../store/pedido.store';
import { Comanda } from '../../pizzaria/types/pedido';

interface GerenciarMesaDialogProps {
  mesaId: number;
  onClose: () => void;
}

export const GerenciarMesaDialog: React.FC<GerenciarMesaDialogProps> = ({ mesaId, onClose }) => {
  const { comandas, pagarComanda, finalizarMesa, abrirComanda } = usePedidoStore();
  const comandasDaMesa = comandas.filter(c => c.mesaId === mesaId);
  const todasPagas = comandasDaMesa.length > 0 && comandasDaMesa.every(c => c.status === 'PAGA');

  const [novoCliente, setNovoCliente] = useState('');

  const handleAbrirComanda = () => {
    if (!novoCliente) return alert('Informe o nome do cliente.');
    abrirComanda(mesaId, novoCliente, [], 0);
    setNovoCliente('');
  };

  const handleFinalizarMesa = () => {
    const sucesso = finalizarMesa(mesaId);
    if (sucesso) {
      alert('Mesa finalizada com sucesso!');
      onClose();
    } else {
      alert('Não é possível finalizar. Existem comandas abertas.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Mesa {mesaId}</h2>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Abrir Nova Comanda</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome do Cliente" 
              className="border p-2 rounded flex-1"
              value={novoCliente}
              onChange={(e) => setNovoCliente(e.target.value)}
            />
            <button 
              onClick={handleAbrirComanda}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Comandas Atuais ({comandasDaMesa.length})</h3>
          {comandasDaMesa.length === 0 ? (
            <p className="text-gray-500">Nenhuma comanda aberta para esta mesa.</p>
          ) : (
            <ul className="space-y-3">
              {comandasDaMesa.map(comanda => (
                <li key={comanda.id} className="flex justify-between items-center border p-3 rounded bg-white shadow-sm">
                  <div>
                    <p className="font-medium">{comanda.nomeCliente}</p>
                    <p className="text-sm text-gray-500">Total: R$ {comanda.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${comanda.status === 'PAGA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {comanda.status}
                    </span>
                  </div>
                  {comanda.status === 'ABERTA' && (
                    <button 
                      onClick={() => pagarComanda(comanda.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Pagar Conta
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            Fechar
          </button>
          <button 
            onClick={handleFinalizarMesa}
            disabled={!todasPagas}
            className={`px-4 py-2 rounded text-white font-bold ${todasPagas ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Finalizar Mesa
          </button>
        </div>
      </div>
    </div>
  );
};
