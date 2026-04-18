import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <Link to="/" className="logo">Slot<span>ify</span></Link>
      {user && (
        <div className="nav-links">
          {user.role === 'user' ? (
            <>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Home size={18} /> Home</Link>
              <Link to="/my-bookings" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={18} /> My Bookings</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutDashboard size={18} /> Dashboard</Link>
              <Link to="/add-service" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><PlusCircle size={18} /> Add Service</Link>
            </>
          )}
          <button onClick={handleLogout} className="btn-outline-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}