// client/src/pages/player/MainPlayer.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import AccessibilitySettings from '../../components/shared/AccessibilitySettings';

const MainPlayer = () => {
  const { user } = useAuth();
  const { 
    socket, 
    connected,
    currentSession,
    joinSession,
    connectedUsers 
  } = useSocket();
  const { highContrast, fontSize } = useTheme();
  const navigate = useNavigate();

  // State
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeSession, setActiveSession] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Update connection status based on socket connection
  useEffect(() => {
    if (connected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus(prev => prev === 'connected' ? 'reconnecting' : 'connecting');
    }
  }, [connected]);

  // Update session state from socket context
  useEffect(() => {
    if (currentSession) {
      setActiveSession(currentSession);
      if (currentSession.connectedUsers !== undefined) {
        setUserCount(currentSession.connectedUsers);
      }
      setLoading(false);
    }
  }, [currentSession]);

  // Update user count from connected users array
  useEffect(() => {
    if (Array.isArray(connectedUsers)) {
      setUserCount(connectedUsers.length);
    }
  }, [connectedUsers]);

  // Find and join active session
  const findAndJoinSession = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setLoading(true);
      
      // Find active session
      const response = await sessionAPI.getActiveSessions(true);
      
      if (response.data.success && response.data.session) {
        // Get active session
        const session = response.data.session;
        setActiveSession(session);
        
        // Join session via socket if connected
        if (socket && connected) {
          joinSession(session._id);
          setConnectionStatus('connected');
        } else {
          // We found a session but socket isn't connected
          setConnectionStatus('waiting');
        }
      } else {
        // No active session found
        setActiveSession(null);
        setConnectionStatus('waiting');
      }
      
      setErrorMessage('');
    } catch (error) {
      console.error('Error joining session:', error);
      setConnectionStatus('error');
      setErrorMessage('Could not join rehearsal session. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [socket, connected, joinSession]);
  
  // Handle socket reconnection attempts
  useEffect(() => {
    const handleReconnectAttempt = () => {
      setReconnectAttempts(prev => prev + 1);
      setConnectionStatus('reconnecting');
    };

    if (socket) {
      socket.on('reconnect_attempt', handleReconnectAttempt);
      return () => {
        socket.off('reconnect_attempt', handleReconnectAttempt);
      };
    }
  }, [socket]);
  
  // Initial session join
  useEffect(() => {
    if (user) {
      findAndJoinSession();
    }
  }, [user, findAndJoinSession]);
  
  // Listen for song selection events
  useEffect(() => {
    if (!socket) return;
    
    const handleSongSelected = ({ songId }) => {
      if (activeSession) {
        // Navigate to live page with song and session info
        navigate(`/live?songId=${songId}&sessionId=${activeSession._id}`);
      }
    };
    
    socket.on('song_selected', handleSongSelected);
    
    return () => {
      socket.off('song_selected', handleSongSelected);
    };
  }, [socket, activeSession, navigate]);

  // Handle manual reconnection
  const handleManualReconnect = () => {
    setReconnectAttempts(0);
    findAndJoinSession();
  };

  // Styling for status indicator
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-success text-white';
      case 'error':
        return 'bg-error text-white';
      case 'reconnecting':
        return 'bg-warning text-black';
      case 'waiting':
        return 'bg-accent text-secondary-dark';
      default:
        return 'bg-info text-white';
    }
  };

  // Text for status indicator
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to rehearsal';
      case 'error':
        return 'Connection error';
      case 'reconnecting':
        return `Reconnecting... (Attempt ${reconnectAttempts})`;
      case 'waiting':
        return 'Waiting for admin to start';
      default:
        return 'Connecting...';
    }
  };

  // Get font size class based on theme context
  const fontSizeClass = {
    'normal': 'text-xl',
    'large': 'text-2xl',
    'x-large': 'text-3xl'
  }[fontSize] || 'text-xl';

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <LoadingIndicator size="lg" color="primary" />
          <p className="mt-4 text-xl text-text-light">Connecting to rehearsal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-background ${highContrast ? 'high-contrast' : ''}`}>
      <div className="max-w-md w-full text-center">
        <h1 className={`text-4xl font-bold text-text-light mb-6 animate-fade-in ${fontSizeClass}`}>
          Waiting for next song
        </h1>
        
        <Card className="mb-8 p-6 animate-slide-up">
          <p className={`mb-4 text-text-muted ${fontSizeClass}`}>
            The band leader will select a song soon
          </p>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusColor()}`}>
            <span 
              className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus === 'connecting' || connectionStatus === 'reconnecting' 
                  ? 'animate-pulse-slow' 
                  : ''
              }`}>
            </span>
            {getStatusText()}
          </div>
          
          {userCount > 0 && (
            <p className={`mt-4 text-text-muted ${fontSizeClass}`}>
              {userCount} {userCount === 1 ? 'musician' : 'musicians'} connected
            </p>
          )}
          
          {activeSession && (
            <div className="mt-4 text-text-muted">
              <p>Session: {activeSession.name}</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-error bg-opacity-20 text-error rounded">
              {errorMessage}
            </div>
          )}
          
          {(connectionStatus === 'error' || reconnectAttempts > 2) && (
            <Button
              onClick={handleManualReconnect}
              variant="primary"
              className="mt-4"
            >
              Reconnect
            </Button>
          )}
        </Card>
        
        {user && (
          <div className={`text-text-muted ${fontSizeClass}`}>
            <p className="mb-2">
              Signed in as <span className="font-semibold">{user.username}</span>
            </p>
            <p>
              Instrument: <span className="font-semibold">
                {user.instrument === 'other' ? user.otherInstrument : user.instrument}
              </span>
            </p>
          </div>
        )}
      </div>
      
      {/* Accessibility settings toggle */}
      <AccessibilitySettings />
    </div>
  );
};

export default MainPlayer;