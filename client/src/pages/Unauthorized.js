// client/src/components/pages/Unauthorized.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-error mb-4">Access Denied</h1>
        
        <div className="text-text-light mb-6">
          <p className="mb-2">You dont have permission to access this page.</p>
          <p>Please contact an administrator if you believe this is an error.</p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn-secondary"
          >
            Go Back
          </button>
          
          <Link 
            to={user?.isAdmin ? '/admin' : '/player'} 
            className="btn-primary"
          >
            {user?.isAdmin ? 'Admin Dashboard' : 'Player Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;