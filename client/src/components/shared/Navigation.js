// client/src/components/shared/Navigation.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">
          JaMoveo
        </Link>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            {user.username} ({user.instrument})
          </span>
          
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;