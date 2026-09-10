import React, { useState } from 'react';
import { usePedidoStore } from '../../../store/pedido.store';
import { GerenciarMesaDialog } from '../components/GerenciarMesaDialog';

export const BalcaoPage: React.FC = () => {
  const { mesas, comandas } = usePedidoStore();
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Controle de Mesas e Comandas</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map(mesa => {
          const comandasDaMesa = comandas.filter(c => c.mesaId === mesa.id);
          const comandasAbertas = comandasDaMesa.filter(c => c.status === 'ABERTA').length;

          return (
            <div 
              key={mesa.id} 
              onClick={() => setMesaSelecionada(mesa.id)}
              className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:shadow-lg ${
                mesa.status === 'OCUPADA' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <h2 className="text-xl font-bold text-gray-800">Mesa {mesa.id}</h2>
              <p className={`mt-2 font-semibold ${mesa.status === 'OCUPADA' ? 'text-blue-600' : 'text-green-600'}`}>
                {mesa.status}
              </p>
              {mesa.status === 'OCUPADA' && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>{comandasDaMesa.length} Comanda(s)</p>
                  {comandasAbertas > 0 && (
                    <p className="text-red-500 font-bold">{comandasAbertas} Pendente(s)</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mesaSelecionada !== null && (
        <GerenciarMesaDialog 
          mesaId={mesaSelecionada} 
          onClose={() => setMesaSelecionada(null)} 
        />
      )}
    </div>
  );
};
