import { createContext, useContext, useState } from "react";

const CarContext = createContext(null);

export function CarProvider({ children }) {
  const [activeCar, setActiveCar] = useState(null);

  return (
    <CarContext.Provider value={{ activeCar, setActiveCar }}>
      {children}
    </CarContext.Provider>
  );
}

export function useCar() {
  const ctx = useContext(CarContext);
  if (!ctx) throw new Error("CarProvider missing");
  return ctx;
}
