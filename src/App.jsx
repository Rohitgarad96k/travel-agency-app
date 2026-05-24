import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Vehicles from './pages/Vehicles'; 
import Trips from './pages/Trips'; 
import Expenses from './pages/Expenses'; 
import Dashboard from './pages/Dashboard'; 
import Reports from './pages/Reports'; // <-- Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="trips" element={<Trips />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} /> {/* <-- Updated route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;