// client/src/components/shared/Navigation.js (Enhanced)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useSession } from '../../hooks/useSession';
import Button from '../ui/Button';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { connected, currentSession } = useSocket();
  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state for session information
  const [sessionInfo, setSessionInfo] = useState({
    active: false,
    name: '',
    userCount: 0,
    songTitle: ''
  });
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Update session info when socket data changes
  useEffect(() => {
    if (currentSession) {
      setSessionInfo({
        active: true,
        name: currentSession.name || 'Rehearsal Session',
        userCount: currentSession.connectedUsers || 0,
        songTitle: currentSession.activeSong?.title || ''
      });
    } else if (session) {
      setSessionInfo({
        active: true,
        name: session.name || 'Rehearsal Session',
        userCount: Array.isArray(session.connectedUsers) ? session.connectedUsers.length : 0,
        songTitle: session.activeSong?.title || ''
      });
    } else {
      setSessionInfo({
        active: false,
        name: '',
        userCount: 0,
        songTitle: ''
      });
    }
  }, [currentSession, session]);
  
  // Determine if we're on the live page
  const isLivePage = location.pathname === '/live';

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navigation when user is not logged in
  if (!user) return null;
  
  // Don't show full navigation on live page to maximize screen space
  if (isLivePage) {
    return (
      <nav className="bg-surface shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              JaMoveo
            </Link>
            
            {/* Live Indicator */}
            <div className="flex items-center">
              <div className="flex items-center px-3 py-1 bg-error bg-opacity-20 rounded-full">
                <span className="animate-pulse w-2 h-2 rounded-full bg-error mr-2"></span>
                <span className="text-sm text-error font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-surface shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and navigation links */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              JaMoveo
            </Link>
            
            {/* Desktop navigation links */}
            <div className="ml-8 hidden md:flex space-x-4">
              {/* Common links for all authenticated users */}
              <Link to="/profile" className="text-text-light hover:text-primary">
                Profile
              </Link>
              
              {/* Admin-only links */}
              {user.isAdmin && (
                <>
                  <Link to="/admin" className="text-text-light hover:text-primary">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/songs" className="text-text-light hover:text-primary">
                    Manage Songs
                  </Link>
                </>
              )}
              
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
          
          {/* Session status + User info + Logout */}
          <div className="flex items-center space-x-4">
            {/* Session Status Indicator */}
            {!sessionLoading && (
              <div className="hidden sm:block">
                {sessionInfo.active ? (
                  <div className="flex items-center bg-surface-light rounded-full px-3 py-1 text-sm border border-gray-700">
                    <div className="flex items-center mr-3">
                      <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                      <span className="text-text-light font-medium">Session Active</span>
                    </div>
                    
                    {sessionInfo.userCount > 0 && (
                      <div className="text-text-muted border-l border-gray-700 pl-3">
                        {sessionInfo.userCount} {sessionInfo.userCount === 1 ? 'musician' : 'musicians'}
                      </div>
                    )}
                    
                    {sessionInfo.songTitle && (
                      <div className="ml-3 text-primary truncate max-w-xs">
                        <span className="text-text-muted mr-1">Now:</span>
                        {sessionInfo.songTitle}
                      </div>
                    )}
                  </div>
                ) : connected ? (
                  <div className="flex items-center bg-surface-light rounded-full px-3 py-1 text-sm border border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                    <span className="text-text-light">Ready for session</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-surface-light rounded-full px-3 py-1 text-sm border border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse mr-2"></span>
                    <span className="text-text-light">Disconnected</span>
                  </div>
                )}
              </div>
            )}
            
            {/* User Info */}
            <div className="text-text-light">
              <span className="font-semibold">{user.username}</span>
              <span className="ml-2 text-text-muted">
                {user.isAdmin ? 'Admin' : user.instrument}
              </span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-error text-white text-sm"
            >
              Logout
            </button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-text-light hover:bg-gray-700 focus:outline-none"
              >
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 border-t border-gray-700 mt-2">
            <Link 
              to="/profile" 
              className="block px-3 py-2 rounded-md text-text-light hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            
            {user.isAdmin ? (
              <>
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 rounded-md text-text-light hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <Link 
                  to="/admin/songs" 
                  className="block px-3 py-2 rounded-md text-text-light hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manage Songs
                </Link>
              </>
            ) : (
              <Link 
                to="/player" 
                className="block px-3 py-2 rounded-md text-text-light hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rehearsal Room
              </Link>
            )}
            
            {user.instrument === 'vocals' && (
              <Link 
                to="/vocals-view" 
                className="block px-3 py-2 rounded-md text-text-light hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vocals View
              </Link>
            )}
            
            {/* Session status for mobile */}
            {sessionInfo.active && (
              <div className="px-3 py-2 mt-2 border-t border-gray-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                  <span className="text-text-light font-medium">Session Active</span>
                </div>
                
                {sessionInfo.userCount > 0 && (
                  <div className="text-text-muted mt-1">
                    {sessionInfo.userCount} {sessionInfo.userCount === 1 ? 'musician' : 'musicians'} connected
                  </div>
                )}
                
                {sessionInfo.songTitle && (
                  <div className="text-primary mt-1">
                    <span className="text-text-muted">Now playing: </span>
                    {sessionInfo.songTitle}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;