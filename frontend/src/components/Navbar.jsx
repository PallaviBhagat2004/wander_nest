import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span role="img" aria-label="hut">🏖️</span> Wanderlust
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/listings/new" className="btn-primary">
              <span className="hide-on-mobile">+ Add Listing</span>
              <span className="show-on-mobile">+ Add</span>
            </Link>
            <span className="user-chip">Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn-ghost">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
