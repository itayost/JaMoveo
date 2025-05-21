// client/src/pages/player/MainPlayer.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';

/**
 * Main Player Page - Shows waiting screen for musicians
 * Displays "Waiting for next song" until admin selects a song
 */
const MainPlayer = () => {
  const { user } = useAuth();
  const { socket, connected, joinSession } = useSocket();
  const { highContrast } = useTheme();
  const navigate = useNavigate();

  // Join session when socket connects
  useEffect(() => {
    const findAndJoinSession = async () => {
      if (socket && connected) {
        // The joinSession function in useSocket context should handle finding
        // the active session and joining it. We don't need to track the session
        // ID here as that will be provided with the song_selected event.
        joinSession();
      }
    };

    findAndJoinSession();
  }, [socket, connected, joinSession]);

  // Listen for song selection events
  useEffect(() => {
    if (!socket) return;
    
    const handleSongSelected = (data) => {
      // Navigate to live page when song is selected
      // The data object should include songId and sessionId from the server
      navigate(`/live?songId=${data.songId}&sessionId=${data.sessionId}`);
    };
    
    socket.on('song_selected', handleSongSelected);
    
    return () => {
      socket.off('song_selected', handleSongSelected);
    };
  }, [socket, navigate]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-background ${highContrast ? 'high-contrast' : ''}`}>
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-text-light mb-6">
          Waiting for next song
        </h1>
        
        <Card className="mb-8 p-6">
          <p className="mb-4 text-text-muted text-xl">
            The band leader will select a song soon
          </p>
          
          {/* Simple connection status */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            connected ? 'bg-success text-white' : 'bg-warning text-black'
          }`}>
            <span className={`w-3 h-3 rounded-full mr-2 ${!connected ? 'animate-pulse' : ''}`}></span>
            {connected ? 'Connected to rehearsal' : 'Connecting...'}
          </div>
        </Card>
        
        {/* User info */}
        {user && (
          <div className="text-text-muted text-xl">
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
    </div>
  );
};

export default MainPlayer;