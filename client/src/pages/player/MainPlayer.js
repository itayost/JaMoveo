// client/src/pages/player/MainPlayer.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const MainPlayer = () => {
  const { user } = useAuth();
  const { socket, connected, joinSession } = useSocket();
  const navigate = useNavigate();

  // State
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          }
        } else {
          // No active session found
          setActiveSession(null);
        }
        
        setError('');
      } catch (error) {
        console.error('Error joining session:', error);
        setError('Could not join rehearsal session. Please try again.');
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
    try {
      // Find active session
      const response = await sessionAPI.getActiveSessions(true);
      
      if (response.data.success && response.data.session) {
        setActiveSession(response.data.session);
        
        if (socket && connected) {
          joinSession(response.data.session._id);
        }
      } else {
        setActiveSession(null);
      }
      
      setError('');
    } catch (error) {
      setError('Connection failed. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <LoadingIndicator size="lg" />
          <p className="mt-4 text-xl text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-background`}>
      <div className="w-full max-w-md">
        <Card className="p-6 text-center">
          <h1 className="text-3xl font-bold mb-6">Waiting for next song</h1>
          
          {error && (
            <div className="mb-6 p-3 bg-error/20 text-error rounded">
              {error}
              <Button
                onClick={handleRetry}
                variant="primary"
                className="mt-3"
              >
                Retry Connection
              </Button>
            </div>
          )}
          
          <p className="text-xl mb-4">The admin will select a song soon</p>
          
          {user && (
            <div className="mt-8 text-text-muted">
              <p>Logged in as: <span className="font-semibold">{user.username}</span></p>
              <p>
                Instrument: <span className="font-semibold">
                  {user.instrument === 'other' ? user.otherInstrument : user.instrument}
                </span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MainPlayer;