import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { ReservationProvider } from './context/ReservationContext';

import Totem from './pages/Totem';
import PainelAtendente from './pages/PainelAtendente';
import ReservaMesa from './pages/ReservaMesa';
import PainelReservas from './pages/PainelReservas';

export default function App() {
  return (
    <OrderProvider>
      <ReservationProvider>
        <BrowserRouter>
          <nav style={{ padding: '1rem', backgroundColor: '#333', color: '#fff', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/totem" style={{ color: '#fff', textDecoration: 'none' }}>Totem de Pedidos</Link>
            <Link to="/atendente" style={{ color: '#fff', textDecoration: 'none' }}>Painel Atendente</Link>
            <Link to="/reserva" style={{ color: '#fff', textDecoration: 'none' }}>Reservar Mesa</Link>
            <Link to="/gestao-reservas" style={{ color: '#fff', textDecoration: 'none' }}>Gestão de Reservas</Link>
          </nav>

          <Routes>
            <Route path="/totem" element={<Totem />} />
            <Route path="/atendente" element={<PainelAtendente />} />
            <Route path="/reserva" element={<ReservaMesa />} />
            <Route path="/gestao-reservas" element={<PainelReservas />} />
          </Routes>
        </BrowserRouter>
      </ReservationProvider>
    </OrderProvider>
  );
}