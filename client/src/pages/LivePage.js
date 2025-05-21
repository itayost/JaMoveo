// client/src/pages/LivePage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

/**
 * LivePage displays the currently selected song during a rehearsal session
 * Enhanced for better readability in smoky environments and bilingual support
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
  const { 
    socket, 
    connected, 
    toggleAutoScroll: socketToggleAutoScroll,
    quitSong: socketQuitSong
  } = useSocket();
  const { 
    highContrast, 
    fontSize, 
    toggleTextDirectionForLanguage,
    textDirection
  } = useTheme();
  const { song, loading: songLoading, error: songError } = useSong(songId);
  const { endSession } = useSession();
  
  // State management
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState(connected ? 'connected' : 'connecting');
  const [showControls, setShowControls] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [connectedUserCount, setConnectedUserCount] = useState(0);
  
  // Refs
  const contentRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

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
    
    // Listen for auto-scroll commands from admin
    const handleAutoScrollState = (data) => {
      console.log('Received autoscroll_state event:', data);
      setAutoScroll(data.enabled);
      if (data.speed) setScrollSpeed(parseFloat(data.speed));
    };
    
    // Listen for session state updates
    const handleSessionState = (data) => {
      if (data.connectedUsers !== undefined) {
        setConnectedUserCount(data.connectedUsers);
      }
    };
    
    // Listen for user joined/left events to update count
    const handleUserJoined = () => {
      setConnectedUserCount(prev => prev + 1);
    };
    
    const handleUserLeft = () => {
      setConnectedUserCount(prev => Math.max(0, prev - 1));
    };
    
    // Register event listeners
    socket.on('song_quit', handleSongQuit);
    socket.on('autoscroll_state', handleAutoScrollState);
    socket.on('session_state', handleSessionState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    
    // Cleanup listeners when component unmounts
    return () => {
      // Clear any active scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      
      // Remove event listeners
      socket.off('song_quit', handleSongQuit);
      socket.off('autoscroll_state', handleAutoScrollState);
      socket.off('session_state', handleSessionState);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      
      // Leave session
      socket.emit('leave_session');
    };
  }, [socket, connected, sessionId, user, navigate]);

  // Auto-scroll implementation
  const startAutoScroll = useCallback(() => {
    // Clear any existing interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    
    setIsScrolling(true);
    
    // Set up new scroll interval with dynamic speed
    scrollIntervalRef.current = setInterval(() => {
      // Calculate scroll speed based on document length and content
      const baseSpeed = scrollSpeed; // pixels per interval
      const pixelsPerInterval = Math.max(0.5, Math.min(5, baseSpeed));
      
      window.scrollBy({
        top: pixelsPerInterval,
        behavior: 'auto' // Using 'auto' instead of 'smooth' for consistent scrolling
      });
      
      // Check if we've reached the bottom and should stop scrolling
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        clearInterval(scrollIntervalRef.current);
        setAutoScroll(false);
        setIsScrolling(false);
        
        // Emit auto-scroll state to server
        if (socket && connected && sessionId) {
          socketToggleAutoScroll(sessionId, false, scrollSpeed);
        }
      }
    }, 20); // Smaller interval for smoother scrolling
  }, [scrollSpeed, socket, connected, sessionId, socketToggleAutoScroll]);

  // Toggle auto-scroll effect
  useEffect(() => {
    if (autoScroll && !isScrolling) {
      startAutoScroll();
    } else if (!autoScroll && isScrolling) {
      // Stop auto-scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      setIsScrolling(false);
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, isScrolling, startAutoScroll]);

  // Auto-hide controls after period of inactivity
  useEffect(() => {
    // Only auto-hide on smaller screens and when not an admin
    const shouldAutoHide = window.innerWidth < 768 && !user?.isAdmin;
    
    if (shouldAutoHide) {
      const handleUserInteraction = () => {
        setShowControls(true);
        
        // Clear any existing timer
        if (hideControlsTimerRef.current) {
          clearTimeout(hideControlsTimerRef.current);
        }
        
        // Set new timer to hide controls after 5 seconds of inactivity
        hideControlsTimerRef.current = setTimeout(() => {
          setShowControls(false);
        }, 5000);
      };
      
      // Listen for user interactions
      window.addEventListener('touchstart', handleUserInteraction);
      window.addEventListener('mousemove', handleUserInteraction);
      window.addEventListener('scroll', handleUserInteraction);
      
      // Initial timer
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      
      return () => {
        window.removeEventListener('touchstart', handleUserInteraction);
        window.removeEventListener('mousemove', handleUserInteraction);
        window.removeEventListener('scroll', handleUserInteraction);
        
        if (hideControlsTimerRef.current) {
          clearTimeout(hideControlsTimerRef.current);
        }
      };
    }
    
    return undefined;
  }, [user?.isAdmin]);

  // Set text direction based on song language
  useEffect(() => {
    if (song?.language) {
      toggleTextDirectionForLanguage(song.language);
    }
  }, [song?.language, toggleTextDirectionForLanguage]);

  // Handle quit song (admin only)
  const handleQuitSong = async () => {
    try {
      if (!sessionId) return;
      
      // Stop any auto-scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        setAutoScroll(false);
        setIsScrolling(false);
      }
      
      // Emit socket event
      if (socket && connected) {
        socketQuitSong(sessionId);
      } else {
        // Fallback to HTTP if socket is not connected
        await endSession(sessionId);
        navigate('/admin');
      }
      
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Handle auto-scroll toggle
  const handleToggleAutoScroll = () => {
    const newState = !autoScroll;
    setAutoScroll(newState);
    
    // Emit auto-scroll state to server
    if (socket && connected && sessionId) {
      socketToggleAutoScroll(sessionId, newState, scrollSpeed);
    }
  };

  // Handle scroll speed change
  const handleChangeScrollSpeed = (amount) => {
    const newSpeed = Math.max(0.5, Math.min(5, scrollSpeed + amount));
    setScrollSpeed(newSpeed);
    
    // Emit updated speed if auto-scroll is enabled
    if (autoScroll && socket && connected && sessionId) {
      socketToggleAutoScroll(sessionId, autoScroll, newSpeed);
    }
  };

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
  
  // Determine font size class based on theme context and high contrast mode
  const fontSizeClass = highContrast
    ? {
        'normal': 'text-xl',
        'large': 'text-2xl',
        'x-large': 'text-3xl'
      }[fontSize] || 'text-xl'
    : {
        'normal': 'text-lg',
        'large': 'text-xl',
        'x-large': 'text-2xl'
      }[fontSize] || 'text-lg';
  
  // Additional classes for high contrast mode
  const contrastClasses = highContrast ? 'leading-relaxed tracking-wide' : '';

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
      
      {/* Sticky header with song info */}
      <header className="sticky-header shadow-md border-b border-gray-700 mb-4">
        <div className="container mx-auto px-4 py-3">
          <h1 
            className={`text-3xl font-bold text-text-light ${fontSizeClass} ${contrastClasses}`}
          >
            {song.title}
          </h1>
          <p 
            className={`text-xl text-text-muted ${fontSizeClass}`}
          >
            {song.artist}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {song.key && (
              <div className="inline-flex items-center">
                <span className="text-sm text-accent mr-2">Key:</span>
                <span className="text-sm font-mono bg-surface-elevated px-2 py-1 rounded">{song.key}</span>
              </div>
            )}
            
            {connectedUserCount > 0 && (
              <div className="inline-flex items-center text-text-muted text-sm">
                <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                {connectedUserCount} {connectedUserCount === 1 ? 'musician' : 'musicians'} connected
              </div>
            )}
            
            {isHebrewSong && (
              <div className="inline-flex items-center">
                <span className="text-xs text-white bg-accent px-2 py-1 rounded-full">עברית</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Role-based content rendering with enhanced styling */}
        {user?.instrument === 'vocals' ? (
          // Vocalist view - lyrics only
          <div className={`lyrics-text ${fontSizeClass} ${contrastClasses} ${isHebrewSong ? 'lyrics-hebrew' : ''}`}>
            <h2 className="text-xl mb-4 text-primary font-semibold">Lyrics</h2>
            <pre className={`whitespace-pre-line ${fontSizeClass} pb-8`}>{song.lyrics}</pre>
          </div>
        ) : (
          // Instrumentalist view - chords and lyrics
          <div>
            <div className="mb-8">
              <h2 className={`text-xl mb-4 text-primary font-semibold`}>Chords</h2>
              <div className="bg-surface-elevated p-4 rounded-lg overflow-x-auto scrollbar-visible">
                <pre className={`font-mono whitespace-pre ${fontSizeClass} ${contrastClasses} text-accent`}>{song.chords}</pre>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className={`text-xl my-4 text-primary font-semibold`}>Lyrics</h2>
              <div className={isHebrewSong ? 'lyrics-hebrew' : ''}>
                <pre className={`whitespace-pre-line ${fontSizeClass} ${contrastClasses}`}>{song.lyrics}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Control panel */}
      <div 
        className={`fixed bottom-0 inset-x-0 p-4 bg-surface shadow-lg border-t border-gray-700 z-20 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full md:translate-y-0'
        }`}
      >
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            {/* Auto-scroll controls */}
            <Button
              onClick={handleToggleAutoScroll}
              variant={autoScroll ? 'primary' : 'secondary'}
              size="md"
              rounded="full"
              className={fontSizeClass}
              iconLeft={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                </svg>
              }
            >
              {autoScroll ? 'Pause Scroll' : 'Auto-Scroll'}
            </Button>
            
            {/* Speed controls, only shown when auto-scroll is active */}
            {autoScroll && (
              <div className="flex items-center space-x-2 bg-surface-elevated p-2 rounded-lg">
                <Button 
                  onClick={() => handleChangeScrollSpeed(-0.5)}
                  variant="ghost"
                  size="sm"
                  iconLeft={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  }
                  disabled={scrollSpeed <= 0.5}
                  ariaLabel="Decrease scroll speed"
                >
                  <span className="sr-only md:not-sr-only">Slower</span>
                </Button>
                
                <span className="text-text-light px-2 font-mono">{scrollSpeed.toFixed(1)}</span>
                
                <Button 
                  onClick={() => handleChangeScrollSpeed(0.5)}
                  variant="ghost"
                  size="sm"
                  iconLeft={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  }
                  disabled={scrollSpeed >= 5}
                  ariaLabel="Increase scroll speed"
                >
                  <span className="sr-only md:not-sr-only">Faster</span>
                </Button>
              </div>
            )}
            
            {/* Scroll to top button */}
            <Button
              onClick={handleScrollToTop}
              variant="secondary"
              size="md"
              rounded="full"
              ariaLabel="Scroll to top"
              iconLeft={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                </svg>
              }
            >
              <span className="sr-only md:not-sr-only">Top</span>
            </Button>
          </div>
          
          {/* Admin-only quit button */}
          <AdminOnly>
            <Button
              onClick={handleQuitSong}
              variant="danger"
              size="md"
              rounded="full"
              iconLeft={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            >
              End Song
            </Button>
          </AdminOnly>
        </div>
      </div>
      
      {/* Tap indicator for mobile (only shows when controls are hidden) */}
      {!showControls && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center z-10 animate-pulse">
          <div className="bg-surface-elevated px-3 py-1 rounded-full text-xs text-text-muted">
            Tap for controls
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePage;