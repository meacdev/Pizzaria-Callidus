import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';

export default function Totem() {
  const { addOrder } = useOrders();
  const [cart, setCart] = useState([]);

  const catalog = [
    { id: 1, name: 'Pizza Calabresa', price: 45.0 },
    { id: 2, name: 'Pizza Quatro Queijos', price: 50.0 },
    { id: 3, name: 'Refrigerante 2L', price: 12.0 },
  ];

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const handleSendOrder = () => {
    if (cart.length === 0) {
      alert('Selecione ao menos um item!');
      return;
    }

    const newOrder = {
      id: `TOTEM-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart,
      total: cart.reduce((acc, item) => acc + item.price, 0),
      status: 'Pendente',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addOrder(newOrder);
    alert(`Pedido #${newOrder.id} enviado ao painel do atendente!`);
    setCart([]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Totem de Autoatendimento</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
        {catalog.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{item.name}</h3>
            <p>R$ {item.price.toFixed(2)}</p>
            <button onClick={() => addToCart(item)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Adicionar
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '2px solid #ccc', paddingTop: '1rem' }}>
        <h3>Carrinho ({cart.length} itens)</h3>
        <ul>
          {cart.map((item, idx) => (
            <li key={idx}>{item.name} - R$ {item.price.toFixed(2)}</li>
          ))}
        </ul>
        <button 
          onClick={handleSendOrder} 
          style={{ padding: '0.8rem 1.5rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Finalizar e Enviar Pedido
        </button>
      </div>
    </div>
  );
}