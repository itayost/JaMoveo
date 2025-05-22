// client/src/App.js
// Main Application Component for JaMoveo
// Handles routing, authentication state, and global UI elements like session expiration and connection warnings
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';

// Layout Components
import Layout from './components/layout/Layout';
import Navigation from './components/shared/Navigation';
import SessionExpired from './components/shared/SessionExpired';
import LoadingScreen from './components/ui/LoadingScreen';

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

/**
 * Main App Component
 * 
 * This is the root component that manages:
 * - Authentication state and routing
 * - Socket connection monitoring
 * - Global UI feedback (session expired, connection issues)
 * - Route protection based on user roles
 */
function App() {
  // Authentication state
  const { user, loading, error, initialized } = useAuth();
  
  // Socket connection state
  const { connected, error: socketError, reconnecting } = useSocket();
  
  // Session expired modal state
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  // Connection warning state
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);
  
   /**
   * Effect: Monitor authentication errors and show session expired modal
   * This helps users understand when they need to log in again
   */
  useEffect(() => {
    if (initialized && error && error.includes('session has expired')) {
      setShowSessionExpired(true);
    }
  }, [error, initialized]);
  
  /**
   * Effect: Monitor socket connection and show connection warnings
   * This provides feedback when real-time features might not work
   */
  useEffect(() => {
    let timeoutId;

    // Show warning if socket connection fails for authenticated users
    if (!connected && !reconnecting && socketError) {
      // Show warning after 5 seconds if still not connected
      timeoutId = setTimeout(() => {
        setShowConnectionWarning(true);
      }, 5000);
    } else {
      // Hide warning when connection is restored
      setShowConnectionWarning(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [connected, reconnecting, socketError]);
  
  /**
   * Show loading screen while authentication is being initialized
   * This prevents flashing of login page before auth state is determined
   */
  if (loading || !initialized) {
    return <LoadingScreen message="Loading JaMoveo..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global UI elements */}
      
      {/* Session expired modal */}
      {showSessionExpired && (
        <SessionExpired onClose={() => setShowSessionExpired(false)} />
      )}
      
      {/* Connection warning */}
      {showConnectionWarning && user && (
        <div className="fixed bottom-4 right-4 bg-warning text-black p-3 rounded-lg shadow-lg max-w-sm z-50">
          <p className="font-medium mb-1">Connection issues detected</p>
          <p className="text-sm mb-2">Unable to connect to the rehearsal server. Features requiring real-time updates may not work.</p>
          <button 
            onClick={() => setShowConnectionWarning(false)}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main content */}
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to={user.isAdmin ? "/admin" : "/player"} replace /> : <Login />
          } />
          
          <Route path="/signup" element={
            user ? <Navigate to={user.isAdmin ? "/admin" : "/player"} replace /> : <Signup />
          } />
          
          <Route path="/admin-signup" element={
            user ? <Navigate to="/admin" replace /> : <AdminSignup />
          } />
          
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

          {/* Default Redirects */}
          <Route 
            path="/" 
            element={
              user 
                ? <Navigate to={user.isAdmin ? "/admin" : "/player"} replace /> 
                : <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;