// client/src/pages/LivePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useSong } from '../hooks/useSong';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingIndicator from '../components/ui/LoadingIndicator';

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);
  
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

  // Add scroll position tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    const handleResize = () => {
      setDocumentHeight(document.body.scrollHeight - window.innerHeight);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial calculations
    handleScroll();
    handleResize();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // Calculate scroll progress
  const scrollProgress = documentHeight > 0 
    ? Math.min(100, Math.max(0, (scrollPosition / documentHeight) * 100)) 
    : 0;
  
  // Get instrument theme class
  const getInstrumentThemeClass = () => {
    if (!user) return 'other-theme';
    
    switch (user.instrument) {
      case 'guitar': return 'guitar-theme';
      case 'bass': return 'bass-theme';
      case 'drums': return 'drums-theme';
      case 'vocals': return 'vocals-theme';
      case 'keyboard': return 'keyboard-theme';
      case 'saxophone': return 'saxophone-theme';
      default: return 'other-theme';
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
  const isHebrewSong = song.language === 'Hebrew';

  return (
    <div 
      className={`
        min-h-screen bg-background pb-24 
        ${highContrast ? 'high-contrast' : ''} 
        ${getInstrumentThemeClass()}
        wave-bg
        animate-fade-in
      `} 
      ref={contentRef}
      dir={isHebrewSong ? 'rtl' : 'ltr'}
    >
      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div 
          className="scroll-indicator-thumb" 
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Connection status indicator */}
      <div className={`
        fixed top-0 right-0 m-2 px-3 py-1 rounded-full text-xs flex items-center z-30
        transition-all duration-300
        ${connected 
          ? 'bg-accent-green/20 text-accent-green shadow-glow-blue' 
          : 'bg-accent-yellow/20 text-accent-yellow animate-pulse'
        }
      `}>
        <span className={`
          w-2 h-2 rounded-full mr-2
          ${connected ? 'bg-accent-green' : 'bg-accent-yellow animate-pulse'}
        `}></span>
        {connected ? 'Connected' : 'Connecting...'}
      </div>
      
      {/* Song info header */}
      <header className="sticky top-0 z-10 bg-background bg-opacity-95 backdrop-blur-sm shadow-md border-b border-gray-700 mb-4 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-text-light mb-1 song-title transition-all duration-300">
            {song.title}
          </h1>
          <p className="text-xl text-text-muted transition-all duration-300">
            {song.artist}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Role-based content rendering */}
        {user?.instrument === 'vocals' ? (
          // Vocalist view - lyrics only
          <div className="lyrics-text animate-slide-up">
            <h2 className="text-xl mb-4 instrument-accent font-semibold transition-all duration-300">
              Lyrics
            </h2>
            <pre className="whitespace-pre-line text-xl pb-8 transition-all duration-300">
              {song.lyrics}
            </pre>
          </div>
        ) : (
          // Instrumentalist view - chords and lyrics
          <div className="animate-slide-up">
            <div className="mb-8">
              <h2 className="text-xl mb-4 instrument-accent font-semibold transition-all duration-300">
                Chords
              </h2>
              <div className="bg-surface-elevated p-4 rounded-lg overflow-x-auto shadow-md transition-all duration-300">
                {/* Enhanced chord display - process chords inline */}
                <div className="font-mono text-xl">
                  {song.chords.split('\n').map((line, i) => {
                    // Enhance chord display by identifying chords with regex
                    const enhancedLine = line.replace(
                      /([A-G][#b]?(?:maj|min|m|dim|aug|sus[24]|[2-9]|add[2-9]|\/[A-G][#b]?)*)/g, 
                      '<span class="chord">$1</span>'
                    );
                    
                    return (
                      <div 
                        key={i} 
                        className="mb-1"
                        dangerouslySetInnerHTML={{ __html: enhancedLine }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl my-4 instrument-accent font-semibold transition-all duration-300">
                Lyrics
              </h2>
              <div className={isHebrewSong ? 'rtl' : ''}>
                <pre className="whitespace-pre-line text-xl transition-all duration-300">
                  {song.lyrics}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Control panel */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-surface shadow-lg border-t border-gray-700 z-20 backdrop-blur-sm transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center">
          {/* Auto-scroll toggle with visualizer */}
          <div className="flex items-center">
            <Button
              onClick={handleToggleAutoScroll}
              variant={autoScroll ? 'primary' : 'secondary'}
              className={`transition-all duration-300 ${autoScroll ? 'shadow-glow' : ''}`}
            >
              {autoScroll ? 'Stop Auto-Scroll' : 'Auto-Scroll'}
            </Button>
            
            {/* Add visualizer when auto-scroll is on */}
            {autoScroll && (
              <div className="scroll-visualizer">
                <div className="visualizer-bar"></div>
                <div className="visualizer-bar"></div>
                <div className="visualizer-bar"></div>
                <div className="visualizer-bar"></div>
                <div className="visualizer-bar"></div>
              </div>
            )}
          </div>
          
          {/* Admin-only quit button */}
          {user?.isAdmin && (
            <Button
              onClick={handleQuitSong}
              variant="danger"
              className="transition-all duration-300 hover:shadow-glow-red"
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