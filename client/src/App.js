// client/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navigation from './components/shared/Navigation'; // Import Navigation component

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminSignup from './pages/auth/AdminSignup';
import Unauthorized from './pages/Unauthorized';

// Player Pages
import MainPlayer from './pages/player/MainPlayer';
import LivePage from './pages/LivePage';

// Admin Pages
import MainAdmin from './pages/admin/MainAdmin';
import ResultsAdmin from './pages/admin/ResultsAdmin';

// Routing Components
import ProtectedRoute from './utils/ProtectedRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import SessionExpired from './components/shared/SessionExpired'; // Add this for session expiration handling

function App() {
  const { user, loading, error, logout } = useAuth();
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  // Show session expired dialog when auth error is set
  useEffect(() => {
    if (error && error.includes('session has expired')) {
      setShowSessionExpired(true);
    }
  }, [error]);
  
  // Listen for auth:expired event
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      setShowSessionExpired(true);
    };
    
    window.addEventListener('auth:expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [logout]);

  if (loading) {
    return <LoadingScreen message="Loading JaMoveo..." />;
  }

  return (
    <div className="min-h-screen bg-background text-text-light">
      {/* Show Navigation only for authenticated users */}
      {user && <Navigation />}
      
      {/* Session expired modal */}
      {showSessionExpired && (
        <SessionExpired onClose={() => setShowSessionExpired(false)} />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Routes for All Authenticated Users */}
        <Route 
          path="/live" 
          element={
            <ProtectedRoute>
              <LivePage />
            </ProtectedRoute>
          }
        />

        {/* Musician Routes */}
        <Route 
          path="/player" 
          element={
            <ProtectedRoute>
              <MainPlayer />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <MainAdmin />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/admin/results" 
          element={
            <ProtectedRoute adminOnly>
              <ResultsAdmin />
            </ProtectedRoute>
          }
        />

        {/* Instrument-Specific Routes (Example) */}
        <Route 
          path="/vocals-view" 
          element={
            <ProtectedRoute allowedRoles={['vocals', 'admin']}>
              <h1>Vocals-Specific View</h1>
            </ProtectedRoute>
          }
        />

        {/* Default Redirects */}
        <Route 
          path="/" 
          element={
            user 
              ? <Navigate to={user.isAdmin ? "/admin" : "/player"} replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;