import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar            from './components/Navbar';
import Login             from './pages/Login';
import Register          from './pages/Register';
import Home              from './pages/Home';
import ServiceDetail     from './pages/ServiceDetail';
import Booking           from './pages/Booking';
import MyBookings        from './pages/MyBookings';
import ProviderDashboard from './pages/ProviderDashboard';
import AddService        from './pages/AddService';

function ProtectedRoute({ children, providerOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (providerOnly && user.role !== 'provider') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/service/:id" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
        <Route path="/book/:serviceId/:itemId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/dashboard"   element={<ProtectedRoute providerOnly><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/add-service" element={<ProtectedRoute providerOnly><AddService /></ProtectedRoute>} />
      </Routes>
    </>
  );
}