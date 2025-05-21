// client/src/pages/player/MainPlayer.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const MainPlayer = () => {
  const { user } = useAuth();
  const { socket, connected, joinSession } = useSocket();
  const { highContrast } = useTheme();
  const navigate = useNavigate();

  // State
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Update connection status based on socket connection
  useEffect(() => {
    setConnectionStatus(connected ? 'connected' : 'connecting');
  }, [connected]);

  // Find and join active session
  useEffect(() => {
    const findAndJoinSession = async () => {
      if (!user) return;
      
      try {
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
    };

    findAndJoinSession();
  }, [user, socket, connected, joinSession]);
  
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

  // Handle retry connection
  const handleRetry = async () => {
    setConnectionStatus('connecting');
    setLoading(true);
    
    try {
      // Find active session
      const response = await sessionAPI.getActiveSessions(true);
      
      if (response.data.success && response.data.session) {
        setActiveSession(response.data.session);
        
        if (socket && connected) {
          joinSession(response.data.session._id);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('waiting');
        }
      } else {
        setActiveSession(null);
        setConnectionStatus('waiting');
      }
      
      setErrorMessage('');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className={`
      min-h-screen flex flex-col items-center justify-center p-4 
      bg-background 
      ${highContrast ? 'high-contrast' : ''} 
      wave-bg
      animate-fade-in
    `}>
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-text-light mb-6 note-animation">
          Waiting for next song
        </h1>
        
        <Card className="mb-8 p-6 shadow-lg transition-all duration-300 hover:shadow-glow-light">
          <p className="mb-4 text-text-muted text-xl">
            The band leader will select a song soon
          </p>
          
          {/* Enhanced connection status */}
          <div className={`
            inline-flex items-center px-4 py-2 rounded-full
            transition-all duration-300
            ${connected 
              ? 'bg-accent-green text-white shadow-glow-blue' 
              : connectionStatus === 'error' ? 'bg-error text-white' : 
                'bg-accent-yellow text-black animate-pulse'}
          `}>
            <span className={`
              w-3 h-3 rounded-full mr-2 
              ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}
            `}></span>
            {connectionStatus === 'connected' ? 'Connected to rehearsal' : 
             connectionStatus === 'error' ? 'Connection error' : 
             'Waiting for admin to start'}
          </div>
          
          {/* Error message */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-error bg-opacity-20 text-error rounded">
              {errorMessage}
            </div>
          )}
          
          {/* Retry button */}
          {connectionStatus === 'error' && (
            <Button
              onClick={handleRetry}
              variant="primary"
              className="mt-4"
            >
              Retry Connection
            </Button>
          )}
        </Card>
        
        {/* User info with subtle animation */}
        {user && (
          <div className="text-text-muted text-xl animate-slide-up">
            <p className="mb-2">
              Signed in as <span className="font-semibold instrument-accent">{user.username}</span>
            </p>
            <p>
              Instrument: <span className="font-semibold instrument-accent">
                {user.instrument === 'other' ? user.otherInstrument : user.instrument}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPlayer;