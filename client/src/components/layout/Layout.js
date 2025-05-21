// client/src/components/layout/Layout.js
import React from 'react';
import Navigation from '../shared/Navigation';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background text-text-light">
      {/* Only show Navigation for authenticated users */}
      {user && <Navigation />}
      
      <main className="container mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;