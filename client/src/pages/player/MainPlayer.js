// client/src/pages/player/MainPlayer.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import AccessibilitySettings from '../../components/shared/AccessibilitySettings';

const MainPlayer = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeSession, setActiveSession] = useState(null);
  const navigate = useNavigate();

  // Find and join active session
  useEffect(() => {
    const findAndJoinSession = async () => {
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
          }
          
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('waiting');
        }
      } catch (error) {
        console.error('Error joining session:', error);
        setConnectionStatus('error');
      }
    };
    
    if (user) {
      findAndJoinSession();
    }
  }, [user, socket, connected]);
  
  // Handle socket events
  useEffect(() => {
    if (!socket || !connected) return;
    
    // Handle song selection
    const handleSongSelected = ({ songId }) => {
      if (activeSession) {
        navigate(`/live?songId=${songId}&sessionId=${activeSession._id}`);
      }
    };
    
    socket.on('song_selected', handleSongSelected);
    
    return () => {
      socket.off('song_selected', handleSongSelected);
    };
  }, [socket, connected, activeSession, navigate]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-success text-white';
      case 'error':
        return 'bg-error text-white';
      case 'waiting':
        return 'bg-accent text-secondary-dark';
      default:
        return 'bg-warning text-white';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to rehearsal';
      case 'error':
        return 'Connection error';
      case 'waiting':
        return 'Waiting for admin to start';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-text-light mb-6 animate-fade-in">
          Waiting for next song
        </h1>
        
        <Card className="mb-8 p-6 animate-slide-up">
          <p className="text-xl text-text-muted mb-4">
            The band leader will select a song soon
          </p>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${getStatusColor()}`}>
            <span className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></span>
            {getStatusText()}
          </div>
        </Card>
        
        {user && (
          <div className="text-text-muted">
            {user.username} • {user.instrument}
          </div>
        )}
      </div>
      
      <AccessibilitySettings />
    </div>
  );
};

export default MainPlayer;