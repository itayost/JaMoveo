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
  const { socket, connected } = useSocket();
  const { highContrast, fontSize } = useTheme();
  const navigate = useNavigate();

  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeSession, setActiveSession] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Find and join active session
  const findAndJoinSession = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Find active session
      const response = await sessionAPI.getActiveSessions();
      
      if (response.data.sessions && response.data.sessions.length > 0) {
        // Get most recent session
        const latestSession = response.data.sessions[0];
        setActiveSession(latestSession);
        
        // Join session in database
        await sessionAPI.joinSession(latestSession._id);
        
        // Join session via socket if connected
        if (socket && connected) {
          socket.emit('join_session', latestSession._id);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('waiting');
        }
      } else {
        setConnectionStatus('waiting');
      }
      
      setErrorMessage('');
    } catch (error) {
      console.error('Error joining session:', error);
      setConnectionStatus('error');
      setErrorMessage('Could not join rehearsal session. Please try again.');
    }
  }, [socket, connected]);
  
  // Effect for initial session join
  useEffect(() => {
    if (user) {
      findAndJoinSession();
    }
  }, [user, findAndJoinSession]);
  
  // Handle socket connection changes
  useEffect(() => {
    if (connected) {
      if (activeSession && socket) {
        socket.emit('join_session', activeSession._id);
        setConnectionStatus('connected');
      }
    } else {
      setConnectionStatus(prev => prev === 'connected' ? 'reconnecting' : prev);
    }
  }, [connected, socket, activeSession]);
  
  // Handle socket events
  useEffect(() => {
    if (!socket) return;
    
    // Handle song selection
    const handleSongSelected = ({ songId }) => {
      if (activeSession) {
        navigate(`/live?songId=${songId}&sessionId=${activeSession._id}`);
      }
    };
    
    // Handle user joined/left events to update user count
    const handleUserJoined = () => {
      setUserCount(prev => prev + 1);
    };
    
    const handleUserLeft = () => {
      setUserCount(prev => Math.max(0, prev - 1));
    };
    
    // Handle session state update
    const handleSessionState = (data) => {
      if (data.connectedUsers) {
        setUserCount(data.connectedUsers);
      }
    };
    
    // Handle errors
    const handleError = (error) => {
      console.error('Socket error:', error);
      setErrorMessage(error.message || 'Connection error occurred');
    };
    
    // Socket reconnection
    const handleReconnectAttempt = () => {
      setReconnectAttempts(prev => prev + 1);
      setConnectionStatus('reconnecting');
    };
    
    // Register event handlers
    socket.on('song_selected', handleSongSelected);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('session_state', handleSessionState);
    socket.on('error', handleError);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    
    return () => {
      // Clean up event handlers
      socket.off('song_selected', handleSongSelected);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('session_state', handleSessionState);
      socket.off('error', handleError);
      socket.off('reconnect_attempt', handleReconnectAttempt);
    };
  }, [socket, activeSession, navigate]);

  // Handle manual reconnection
  const handleManualReconnect = () => {
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
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-error bg-opacity-20 text-error rounded">
              {errorMessage}
            </div>
          )}
          
          {(connectionStatus === 'error' || reconnectAttempts > 3) && (
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
            {user.username} • {user.instrument}
          </div>
        )}
      </div>
      
      {/* Accessibility settings toggle */}
      <AccessibilitySettings />
    </div>
  );
};

export default MainPlayer;