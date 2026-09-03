import React from 'react';
import { useOrders } from '../context/OrderContext';

export default function PainelAtendente() {
  const { orders, updateOrderStatus } = useOrders();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Painel de Gestão de Pedidos</h2>
      {orders.length === 0 ? (
        <p>Nenhum pedido recebido no momento.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: order.status === 'Concluído' ? '#e2f0d9' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{order.id}</strong>
                <span>Horário: {order.time}</span>
              </div>
              <p><strong>Status:</strong> {order.status}</p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>{item.name} - R$ {item.price.toFixed(2)}</li>
                ))}
              </ul>
              <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
              {order.status === 'Pendente' && (
                <button onClick={() => updateOrderStatus(order.id, 'Em Preparo')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                  Iniciar Preparo
                </button>
              )}
              {order.status === 'Em Preparo' && (
                <button onClick={() => updateOrderStatus(order.id, 'Concluído')} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Marcar como Concluído
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}