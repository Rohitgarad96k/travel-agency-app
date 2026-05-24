import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Vehicles from './pages/Vehicles'; 
import Trips from './pages/Trips'; 
import Expenses from './pages/Expenses'; 
import Dashboard from './pages/Dashboard'; 
import Reports from './pages/Reports'; 
import Login from './pages/Login'; // <-- Import Login
import { useAppContext } from './store/AppContext'; // <-- Import context
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';

// A wrapper component that checks if a user is logged in before showing the page
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) {
    // If nobody is logged in, kick them back to the login page
    return <Navigate to="/login" replace />;
  }
  
  // If they are logged in, let them through
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unprotected Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Wrapped inside ProtectedRoute) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="trips" element={<Trips />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;