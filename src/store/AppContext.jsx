import { createContext, useState, useContext, useMemo } from 'react';

// 1. Create the Context
const AppContext = createContext();

// 2. Create the Provider Component
export const AppProvider = ({ children }) => {
  // ==========================================
  // 1. AUTHENTICATION & USER MANAGEMENT
  // ==========================================
  const [users, setUsers] = useState([
    { id: 1, name: 'System Admin', email: 'admin@crm.com', password: 'admin', role: 'admin', status: 'active' },
    { id: 2, name: 'Demo Agency', email: 'user@crm.com', password: 'user', role: 'user', status: 'active' }
  ]);
  
  const [currentUser, setCurrentUser] = useState(null); // null means nobody is logged in

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status !== 'active') return { success: false, message: 'Account disabled by Admin.' };
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const logout = () => setCurrentUser(null);

  // Admin controls for managing users
  const addUser = (user) => setUsers([{ ...user, id: Date.now() }, ...users]);
  const updateUser = (updated) => setUsers(users.map(u => u.id === updated.id ? updated : u));
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));

  // ==========================================
  // 2. RAW DATABASE (Contains EVERYONE'S Data)
  // ==========================================
  // Notice we added "userId: 2" to the mock data so the Demo Agency has cars when they log in!
  const [allVehicles, setAllVehicles] = useState([
    { id: 1, userId: 2, name: 'Toyota Innova (MH-20-EE-1234)', rate: 12, driver: 'Rahul' },
    { id: 2, userId: 2, name: 'Suzuki Swift (MH-20-AB-9876)', rate: 10, driver: 'Amit' }
  ]);
  const [allTrips, setAllTrips] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);

  // ==========================================
  // 3. MULTI-TENANCY PRIVACY FILTERING
  // ==========================================
  // These variables ONLY expose the data belonging to the CURRENT logged-in user.
  // The UI pages consume these, totally unaware that other users exist.
  const vehicles = useMemo(() => allVehicles.filter(v => v.userId === currentUser?.id), [allVehicles, currentUser]);
  const trips = useMemo(() => allTrips.filter(t => t.userId === currentUser?.id), [allTrips, currentUser]);
  const expenses = useMemo(() => allExpenses.filter(e => e.userId === currentUser?.id), [allExpenses, currentUser]);

  // ==========================================
  // 4. DATA ACTIONS (Auto-attaches userId to new data)
  // ==========================================
  const addVehicle = (vehicle) => setAllVehicles([{ ...vehicle, userId: currentUser?.id }, ...allVehicles]);
  const updateVehicle = (updated) => setAllVehicles(allVehicles.map(v => v.id === updated.id ? updated : v));
  const deleteVehicle = (id) => setAllVehicles(allVehicles.filter(v => v.id !== id));

  const addTrip = (trip) => setAllTrips([{ ...trip, userId: currentUser?.id }, ...allTrips]);
  const updateTrip = (updated) => setAllTrips(allTrips.map(t => t.id === updated.id ? updated : t));
  const deleteTrip = (id) => setAllTrips(allTrips.filter(t => t.id !== id));

  const addExpense = (exp) => setAllExpenses([{ ...exp, userId: currentUser?.id }, ...allExpenses]);
  const updateExpense = (updated) => setAllExpenses(allExpenses.map(e => e.id === updated.id ? updated : e));
  const deleteExpense = (id) => setAllExpenses(allExpenses.filter(e => e.id !== id));

  return (
    <AppContext.Provider value={{
      // Auth & Users
      users, currentUser, login, logout, addUser, updateUser, deleteUser,
      
      // Filtered User Data
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      trips, addTrip, updateTrip, deleteTrip,
      expenses, addExpense, updateExpense, deleteExpense,
      
      // Exposing raw system data specifically for the Admin Dashboard
      allVehicles, allTrips, allExpenses
    }}>
      {children}
    </AppContext.Provider>
  );
};

// 4. Custom Hook
export const useAppContext = () => {
  return useContext(AppContext);
};