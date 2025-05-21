import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Simplified Navigation component
 */
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navigation when user is not logged in
  if (!user) return null;

  return (
    <nav className="bg-surface shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            JaMoveo
          </Link>
          
          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="text-text-light mr-4">
              <span className="font-semibold">{user.username}</span>
              <span className="ml-2 text-text-muted">
                {user.isAdmin ? 'Admin' : user.instrument}
              </span>
            </div>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-error text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;