import React, { useState } from 'react';
import { useReservations } from '../context/ReservationContext';

export default function ReservaMesa() {
  const { addReservation } = useReservations();
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    tableNumber: '1',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const newReservation = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      status: 'Confirmada',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addReservation(newReservation);
    alert(`Reserva #${newReservation.id} realizada com sucesso!`);
    setFormData({ clientName: '', phone: '', date: '', time: '', guests: 2, tableNumber: '1' });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Reserva de Mesa</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Nome do Cliente *</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            required
          />
        </div>

        <div>
          <label>Telefone / WhatsApp *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Data *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Horário *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Número de Pessoas</label>
            <input
              type="number"
              name="guests"
              min="1"
              max="20"
              value={formData.guests}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Mesa</label>
            <select
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>Mesa {num}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          style={{ padding: '0.8rem', backgroundColor: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
        >
          Confirmar Reserva
        </button>
      </form>
    </div>
  );
}