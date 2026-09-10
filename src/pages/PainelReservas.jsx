import React from 'react';
import { useReservations } from '../context/ReservationContext';

export default function PainelReservas() {
  const { reservations, updateReservationStatus } = useReservations();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Gestão de Reservas de Mesa</h2>
      {reservations.length === 0 ? (
        <p>Nenhuma reserva realizada até o momento.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reservations.map((res) => (
            <div
              key={res.id}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: res.status === 'Cancelada' ? '#f8d7da' : res.status === 'Finalizada' ? '#e2f0d9' : '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{res.id} — Mesa {res.tableNumber}</strong>
                <span>Status: {res.status}</span>
              </div>
              <p><strong>Cliente:</strong> {res.clientName} ({res.phone})</p>
              <p><strong>Data/Hora:</strong> {res.date} às {res.time}</p>
              <p><strong>Pessoas:</strong> {res.guests}</p>

              {res.status === 'Confirmada' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => updateReservationStatus(res.id, 'Finalizada')}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Marcar como Concluída
                  </button>
                  <button
                    onClick={() => updateReservationStatus(res.id, 'Cancelada')}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancelar Reserva
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}