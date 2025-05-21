// client/src/pages/LivePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useSong } from '../hooks/useSong';
import { useSession } from '../hooks/useSession';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import AdminOnly from '../components/shared/AdminOnly';

const LivePage = () => {
  // Navigation and URL parameters
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const songId = searchParams.get('songId');
  const sessionId = searchParams.get('sessionId');
  
  // Custom hooks
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const { highContrast, fontSize } = useTheme();
  const { song, loading: songLoading, error: songError } = useSong(songId);
  const { endSession } = useSession();
  
  // State management
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
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
    if (!socket || !sessionId) return;
    
    // Join session room
    socket.emit('join_session', sessionId);
    
    // Listen for song_quit event
    const handleSongQuit = () => {
      navigate(user?.isAdmin ? '/admin' : '/player');
    };
    
    // Listen for auto-scroll commands from admin
    const handleAutoScrollState = (data) => {
      setAutoScroll(data.enabled);
      setScrollSpeed(data.speed);
    };
    
    socket.on('song_quit', handleSongQuit);
    socket.on('autoscroll_state', handleAutoScrollState);
    
    // Cleanup listeners when component unmounts
    return () => {
      socket.off('song_quit', handleSongQuit);
      socket.off('autoscroll_state', handleAutoScrollState);
      socket.emit('leave_session');
    };
  }, [socket, sessionId, user, navigate]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && contentRef.current) {
      // Clear any existing interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      
      // Set up new scroll interval
      scrollIntervalRef.current = setInterval(() => {
        if (contentRef.current) {
          window.scrollBy({
            top: scrollSpeed,
            behavior: 'smooth'
          });
          
          // Check if we've reached the bottom and should stop scrolling
          const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
          if (scrollTop + clientHeight >= scrollHeight - 20) {
            clearInterval(scrollIntervalRef.current);
            setAutoScroll(false);
          }
        }
      }, 50);
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, scrollSpeed]);

  // Handle quit song (admin only)
  const handleQuitSong = async () => {
    try {
      if (sessionId) {
        // End session via API
        await endSession(sessionId);
        
        // Emit socket event
        if (socket) {
          socket.emit('quit_song', sessionId);
        }
        
        navigate('/admin');
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    const newState = !autoScroll;
    setAutoScroll(newState);
    
    // Emit auto-scroll state to server if in session
    if (socket && sessionId) {
      socket.emit('toggle_autoscroll', {
        sessionId,
        enabled: newState,
        speed: scrollSpeed
      });
    }
  };

  // Handle scroll speed change
  const changeScrollSpeed = (amount) => {
    const newSpeed = Math.max(0.5, scrollSpeed + amount);
    setScrollSpeed(newSpeed);
    
    // Emit updated speed if auto-scroll is enabled
    if (autoScroll && socket && sessionId) {
      socket.emit('toggle_autoscroll', {
        sessionId,
        enabled: autoScroll,
        speed: newSpeed
      });
    }
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
  const textDirection = song.language === 'Hebrew' ? 'rtl' : 'ltr';
  
  // Determine font size class based on theme context
  const fontSizeClass = {
    'normal': 'text-lg',
    'large': 'text-xl',
    'x-large': 'text-2xl'
  }[fontSize] || 'text-lg';

  return (
    <div className={`min-h-screen bg-background ${highContrast ? 'high-contrast' : ''}`} ref={contentRef}>
      {/* Connection status indicator */}
      <div className={`fixed top-0 right-0 m-2 px-3 py-1 rounded-full text-xs flex items-center 
          ${connectionStatus === 'connected' ? 'bg-success text-white' : 'bg-warning text-black'}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></span>
        {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
      </div>
      
      <header className="p-4 border-b border-gray-700">
        <h1 
          className={`text-3xl font-bold text-text-light ${fontSizeClass}`} 
          dir={textDirection}
        >
          {song.title}
        </h1>
        <p 
          className={`text-xl text-text-muted ${fontSizeClass}`} 
          dir={textDirection}
        >
          {song.artist}
        </p>
      </header>

      <main className="p-4 pb-24">
        {/* Role-based content rendering */}
        {user?.instrument === 'vocals' ? (
          // Vocalist view - lyrics only
          <div dir={textDirection} className={`lyrics-text ${fontSizeClass}`}>
            <h2 className="text-xl mb-4">Lyrics</h2>
            <pre className={`whitespace-pre-line ${fontSizeClass}`}>{song.lyrics}</pre>
          </div>
        ) : (
          // Instrumentalist view - chords and lyrics
          <div>
            <h2 className={`text-xl mb-4 ${fontSizeClass}`}>Chords</h2>
            <pre className={`font-mono whitespace-pre-line text-accent ${fontSizeClass}`}>{song.chords}</pre>
            <h2 className={`text-xl my-4 ${fontSizeClass}`}>Lyrics</h2>
            <div dir={textDirection}>
              <pre className={`whitespace-pre-line ${fontSizeClass}`}>{song.lyrics}</pre>
            </div>
          </div>
        )}
      </main>

      {/* Control panel */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-surface shadow-lg border-t border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Auto-scroll controls */}
            <Button
              onClick={toggleAutoScroll}
              variant={autoScroll ? 'primary' : 'secondary'}
              rounded="full"
              className={fontSizeClass}
            >
              {autoScroll ? 'Pause Scroll' : 'Auto-Scroll'}
            </Button>
            
            {autoScroll && (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => changeScrollSpeed(-0.5)}
                  variant="outline"
                  size="sm"
                  disabled={scrollSpeed <= 0.5}
                >
                  Slower
                </Button>
                <span className="text-text-light px-2">{scrollSpeed.toFixed(1)}</span>
                <Button 
                  onClick={() => changeScrollSpeed(0.5)}
                  variant="outline"
                  size="sm"
                >
                  Faster
                </Button>
              </div>
            )}
          </div>
          
          {/* Admin-only quit button */}
          <AdminOnly>
            <Button
              onClick={handleQuitSong}
              variant="danger"
              rounded="full"
            >
              End Song
            </Button>
          </AdminOnly>
        </div>
      </div>
    </div>
  );
};

export default LivePage;