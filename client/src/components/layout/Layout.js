// client/src/components/layout/Layout.js
import React from 'react';
import Navigation from '../shared/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

/**
 * Layout component that handles navigation and page structure
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render inside the layout
 */
const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if the current page is LivePage to hide navigation
  const isLivePage = location.pathname === '/live';
  
  // Don't show navigation on the live page to maximize screen space
  const showNavigation = user && !isLivePage;

  return (
    <div className="min-h-screen bg-background text-text-light flex flex-col">
      {/* Navigation bar - only shown when user is authenticated and not on live page */}
      {showNavigation && <Navigation />}
      
      {/* Main content - with top padding when nav is shown */}
      <main className={`container mx-auto px-4 flex-grow ${showNavigation ? 'pt-14' : 'pt-0'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;