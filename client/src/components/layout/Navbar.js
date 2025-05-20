// client/src/components/layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminOnly from '../common/AdminOnly';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-surface shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              JaMoveo
            </Link>
            
            <div className="ml-8 hidden md:flex space-x-4">
              {/* Common links for all authenticated users */}
              <Link to="/profile" className="text-text-light hover:text-primary">
                Profile
              </Link>
              
              {/* Admin-only links */}
              <AdminOnly>
                <Link to="/admin" className="text-text-light hover:text-primary">
                  Admin Dashboard
                </Link>
                <Link to="/admin/songs" className="text-text-light hover:text-primary">
                  Manage Songs
                </Link>
              </AdminOnly>
              
              {/* Regular user links */}
              {!user.isAdmin && (
                <Link to="/player" className="text-text-light hover:text-primary">
                  Rehearsal Room
                </Link>
              )}
              
              {/* Role-specific links */}
              {user.instrument === 'vocals' && (
                <Link to="/vocals-view" className="text-text-light hover:text-primary">
                  Vocals View
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-text-light">
              <span className="font-semibold">{user.username}</span>
              <span className="ml-2 text-text-muted">
                {user.isAdmin ? 'Admin' : user.instrument}
              </span>
            </div>
            
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

export default Navbar;