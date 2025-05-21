import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useSong } from '../hooks/useSong';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingIndicator from '../components/ui/LoadingIndicator';

/**
 * LivePage displays the currently selected song during a rehearsal session
 * Simplified version with basic auto-scroll
 */
const LivePage = () => {
  // Navigation and URL parameters
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const songId = searchParams.get('songId');
  const sessionId = searchParams.get('sessionId');
  
  // Custom hooks
  const { user } = useAuth();
  const { socket, connected, quitSong: socketQuitSong } = useSocket();
  const { highContrast } = useTheme();
  const { song, loading: songLoading, error: songError } = useSong(songId);
  
  // State management
  const [autoScroll, setAutoScroll] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(connected ? 'connected' : 'connecting');
  
  // Refs
  const contentRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Update connection status when socket state changes
  useEffect(() => {
    setConnectionStatus(connected ? 'connected' : 'connecting');
  }, [connected]);

  // Socket connection and events
  useEffect(() => {
    if (!socket || !connected || !sessionId) return;
    
    // Join session room
    socket.emit('join_session', sessionId);
    
    // Listen for song_quit event
    const handleSongQuit = () => {
      // Clear any active scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        setAutoScroll(false);
      }
      
      // Navigate back to appropriate page
      navigate(user?.isAdmin ? '/admin' : '/player');
    };
    
    // Register event listeners
    socket.on('song_quit', handleSongQuit);
    
    // Cleanup listeners when component unmounts
    return () => {
      // Clear any active scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      
      // Remove event listeners
      socket.off('song_quit', handleSongQuit);
      
      // Leave session
      socket.emit('leave_session');
    };
  }, [socket, connected, sessionId, user, navigate]);

  // Toggle auto-scroll effect
  useEffect(() => {
    if (autoScroll) {
      // Start auto-scrolling
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy({
          top: 2,
          behavior: 'auto'
        });
        
        // Check if we've reached the bottom and should stop scrolling
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          clearInterval(scrollIntervalRef.current);
          setAutoScroll(false);
        }
      }, 50);
    } else {
      // Stop auto-scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll]);

  // Handle quit song (admin only)
  const handleQuitSong = () => {
    if (!sessionId) return;
    
    // Stop any auto-scrolling
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      setAutoScroll(false);
    }
    
    // Emit socket event
    if (socket && connected) {
      socketQuitSong(sessionId);
    } else {
      // Fallback when socket not connected
      navigate('/admin');
    }
  };

  // Handle auto-scroll toggle
  const handleToggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  // Loading state
  if (songLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingIndicator size="lg" color="primary" />
          <p className="mt-4 text-xl text-text-light">Loading song...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (songError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-error">Error</h2>
          <p className="mb-6">{songError}</p>
          <Button 
            onClick={() => navigate(user?.isAdmin ? '/admin' : '/player')}
            variant="primary"
          >
            Back to Main Page
          </Button>
        </Card>
      </div>
    );
  }

  // No song found
  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Song Not Found</h2>
          <p className="mb-6">The requested song could not be found.</p>
          <Button 
            onClick={() => navigate(user?.isAdmin ? '/admin' : '/player')}
            variant="primary"
          >
            Back to Main Page
          </Button>
        </Card>
      </div>
    );
  }

  // Set appropriate text direction based on language
  const isHebrewSong = song.language === 'Hebrew';

  return (
    <div 
      className={`min-h-screen bg-background pb-24 ${highContrast ? 'high-contrast' : ''}`} 
      ref={contentRef}
      dir={isHebrewSong ? 'rtl' : 'ltr'}
    >
      {/* Connection status indicator */}
      <div className={`fixed top-0 right-0 m-2 px-3 py-1 rounded-full text-xs flex items-center z-30
          ${connectionStatus === 'connected' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''} ${
          connectionStatus === 'connected' ? 'bg-success' : 'bg-warning'
        }`}></span>
        {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
      </div>
      
      {/* Song info header */}
      <header className="sticky-header shadow-md border-b border-gray-700 mb-4">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-3xl font-bold text-text-light">
            {song.title}
          </h1>
          <p className="text-xl text-text-muted">
            {song.artist}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Role-based content rendering */}
        {user?.instrument === 'vocals' ? (
          // Vocalist view - lyrics only
          <div className="lyrics-text">
            <h2 className="text-xl mb-4 text-primary font-semibold">Lyrics</h2>
            <pre className="whitespace-pre-line text-xl pb-8">{song.lyrics}</pre>
          </div>
        ) : (
          // Instrumentalist view - chords and lyrics
          <div>
            <div className="mb-8">
              <h2 className="text-xl mb-4 text-primary font-semibold">Chords</h2>
              <div className="bg-surface-elevated p-4 rounded-lg overflow-x-auto">
                <pre className="font-mono whitespace-pre text-xl text-accent">{song.chords}</pre>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl my-4 text-primary font-semibold">Lyrics</h2>
              <div className={isHebrewSong ? 'lyrics-hebrew' : ''}>
                <pre className="whitespace-pre-line text-xl">{song.lyrics}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Control panel */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-surface shadow-lg border-t border-gray-700 z-20">
        <div className="container mx-auto flex justify-between items-center">
          {/* Auto-scroll toggle */}
          <Button
            onClick={handleToggleAutoScroll}
            variant={autoScroll ? 'primary' : 'secondary'}
            size="md"
          >
            {autoScroll ? 'Stop Auto-Scroll' : 'Auto-Scroll'}
          </Button>
          
          {/* Admin-only quit button */}
          {user?.isAdmin && (
            <Button
              onClick={handleQuitSong}
              variant="danger"
              size="md"
            >
              End Song
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePage;