import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../services/api.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={user.is_admin ? '/admin' : '/game'}>
            Word Guess Game
          </Link>
        </div>

        <div className="navbar-menu">
          {user.is_admin ? (
            <Link to="/admin" className="navbar-link">
              Admin Dashboard
            </Link>
          ) : (
            <Link to="/game" className="navbar-link">
              Play Game
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            {user.username} {user.is_admin && <span className="admin-badge">Admin</span>}
          </span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
