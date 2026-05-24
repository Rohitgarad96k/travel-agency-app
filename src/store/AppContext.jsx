import { createContext, useState, useContext } from 'react';

// 1. Create the Context
const AppContext = createContext();

// 2. Create the Provider Component
export const AppProvider = ({ children }) => {
  // Centralized State
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'Toyota Innova (MH-20-EE-1234)', rate: 12, driver: 'Rahul' },
    { id: 2, name: 'Suzuki Swift (MH-20-AB-9876)', rate: 10, driver: 'Amit' }
  ]);
  
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // --- Vehicles Actions ---
  const addVehicle = (vehicle) => setVehicles([vehicle, ...vehicles]);
  
  const deleteVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));
  
  const updateVehicle = (updatedVehicle) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)
    );
  };

  // --- Trips Actions ---
  const addTrip = (trip) => setTrips([trip, ...trips]);
  
  const deleteTrip = (id) => setTrips(trips.filter(t => t.id !== id));
  
  const updateTrip = (updatedTrip) => {
    setTrips(prevTrips => 
      prevTrips.map(t => t.id === updatedTrip.id ? updatedTrip : t)
    );
  };

  // --- Expenses Actions ---
  const addExpense = (expense) => {
    setExpenses([expense, ...expenses]);
  };
  
  const updateExpense = (updatedExpense) => {
    setExpenses(prevExpenses => 
      prevExpenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
    );
  };

  const deleteExpense = (id) => {
    setExpenses(prevExpenses => prevExpenses.filter(e => e.id !== id));
  };

  // 3. Provide the state and actions
  return (
    <AppContext.Provider value={{
      vehicles, addVehicle, deleteVehicle, updateVehicle,
      trips, addTrip, deleteTrip, updateTrip,
      expenses, addExpense, deleteExpense, updateExpense 
    }}>
      {children}
    </AppContext.Provider>
  );
};

// 4. Custom Hook
export const useAppContext = () => {
  return useContext(AppContext);
};