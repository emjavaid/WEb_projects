import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Study<span>Vault</span></Link>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Browse Notes</Link>
        {user ? (
          <>
            <Link to="/upload" className="nav-link">+ Upload</Link>
            <Link to="/profile" className="nav-link">My Profile ({user.name.split(' ')[0]})</Link>
            <button onClick={handleLogout} className="nav-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
