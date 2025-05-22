// client/src/components/shared/Navigation.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

/**
 * Navigation component with fixed positioning
 * 
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

  // Get the appropriate home route based on user role
  const homeRoute = user.isAdmin ? '/admin' : '/player';

  // Determine instrument display text
  const instrumentText = user.isAdmin 
    ? 'Admin' 
    : user.instrument === 'other' 
      ? user.otherInstrument 
      : user.instrument;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-md z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to={homeRoute} className="text-2xl font-bold text-primary">
            JaMoveo
          </Link>
          
          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="text-white">
              <span className="font-semibold">{user.username}</span>
              <span className="ml-2 text-gray-400">
                {instrumentText}
              </span>
            </div>
            
            {/* Logout button */}
            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;