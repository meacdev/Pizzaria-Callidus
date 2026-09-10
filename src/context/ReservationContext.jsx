import React, { createContext, useState, useContext } from 'react';

const ReservationContext = createContext();

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);

  const addReservation = (newReservation) => {
    setReservations((prev) => [newReservation, ...prev]);
  };

  const updateReservationStatus = (id, status) => {
    setReservations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <ReservationContext.Provider value={{ reservations, addReservation, updateReservationStatus }}>
      {children}
    </ReservationContext.Provider>
  );
}

export const useReservations = () => useContext(ReservationContext);