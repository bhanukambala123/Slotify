import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Slot<span>ify</span></Link>
      {user && (
        <div className="nav-links">
          {user.role === 'user' ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/my-bookings">My Bookings</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/add-service">+ Add Service</Link>
            </>
          )}
          <button onClick={handleLogout} className="btn-outline-sm">Logout</button>
        </div>
      )}
    </nav>
  );
}