import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import Totem from './pages/Totem';
import PainelAtendente from './pages/PainelAtendente';

export default function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <nav style={{ padding: '1rem', backgroundColor: '#333', color: '#fff', display: 'flex', gap: '1rem' }}>
          <Link to="/totem" style={{ color: '#fff', textDecoration: 'none' }}>Ir para Totem</Link>
          <Link to="/atendente" style={{ color: '#fff', textDecoration: 'none' }}>Ir para Painel Atendente</Link>
        </nav>

        <Routes>
          <Route path="/totem" element={<Totem />} />
          <Route path="/atendente" element={<PainelAtendente />} />
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  );
}