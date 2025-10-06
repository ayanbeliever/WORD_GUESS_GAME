import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../services/api.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getUser());

  useEffect(() => {
    const onAuthChanged = () => setUserState(getUser());
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={user ? (user.is_admin ? '/admin' : '/game') : '/'}>
            Word Guess Game
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          {user && user.is_admin ? (
            <Link to="/admin" className="navbar-link">Admin Dashboard</Link>
          ) : (
            <Link to="/game" className="navbar-link">Play Game</Link>
          )}
          {!user && <Link to="/about" className="navbar-link">About</Link>}
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              <span className="user-info">
                {user.username} {user.is_admin && <span className="admin-badge">Admin</span>}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
