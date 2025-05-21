// client/src/pages/LivePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSong } from '../hooks/useSong';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
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
  const { song, loading: songLoading, error: songError } = useSong(songId);
  
  // State management
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  
  // Refs
  const contentRef = useRef(null);
  const scrollIntervalRef = useRef(null);

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
          top: 1 * scrollSpeed,
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
  }, [autoScroll, scrollSpeed]);

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
      navigate(user?.isAdmin ? '/admin' : '/player');
    }
  };

  // Handle auto-scroll toggle
  const handleToggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  // Increase scroll speed
  const increaseSpeed = () => {
    setScrollSpeed(prev => Math.min(prev + 0.5, 5));
  };

  // Decrease scroll speed
  const decreaseSpeed = () => {
    setScrollSpeed(prev => Math.max(prev - 0.5, 0.5));
  };

  // Loading state
  if (songLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <LoadingIndicator size="lg" color="primary" />
          <p className="mt-4 text-2xl text-white">Loading song...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (songError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="max-w-md w-full p-6 text-center bg-gray-900">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
          <p className="mb-6 text-white text-xl">{songError}</p>
          <Button 
            onClick={() => navigate(user?.isAdmin ? '/admin' : '/player')}
            variant="primary"
            size="lg"
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
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="max-w-md w-full p-6 text-center bg-gray-900">
          <h2 className="text-2xl font-semibold mb-4 text-white">Song Not Found</h2>
          <p className="mb-6 text-gray-300 text-xl">The requested song could not be found.</p>
          <Button 
            onClick={() => navigate(user?.isAdmin ? '/admin' : '/player')}
            variant="primary"
            size="lg"
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
      className="min-h-screen pb-24 bg-black text-white" 
      ref={contentRef}
      dir={isHebrewSong ? 'rtl' : 'ltr'}
    >
      {/* Song info header */}
      <header className="sticky top-0 z-10 bg-black shadow-lg border-b border-gray-700 mb-6">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white mb-2 song-title">
            {song.title}
          </h1>
          <p className="text-2xl text-gray-300">
            {song.artist}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Role-based content rendering */}
        {user?.instrument === 'vocals' ? (
          // Vocalist view - lyrics only
          <div>
            <pre className="whitespace-pre-line text-2xl leading-relaxed pb-24">
              {song.lyrics}
            </pre>
          </div>
        ) : (
          // Instrumentalist view - chords and lyrics
          <div>
            <div className="mb-10">
              <h2 className="text-2xl mb-4 text-blue-300 font-semibold">
                Chords
              </h2>
              <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto shadow-inner">
                <pre className="font-mono text-2xl text-yellow-300 leading-loose">
                  {song.chords}
                </pre>
              </div>
            </div>
            
            <div className="mb-24">
              <h2 className="text-2xl mb-4 text-blue-300 font-semibold">
                Lyrics
              </h2>
              <pre className="whitespace-pre-line text-2xl leading-relaxed">
                {song.lyrics}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Control panel */}
      <div className="fixed bottom-0 inset-x-0 py-5 px-6 bg-gray-900 shadow-lg border-t border-gray-700 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Auto-scroll controls */}
            <Button
              onClick={handleToggleAutoScroll}
              variant={autoScroll ? 'primary' : 'secondary'}
              size="lg"
              className="px-6 py-3 text-lg"
            >
              {autoScroll ? 'Stop Auto-Scroll' : 'Auto-Scroll'}
            </Button>
            
            {/* Speed controls - only show when auto-scroll is active */}
            {autoScroll && (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={decreaseSpeed}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600 text-xl"
                  disabled={scrollSpeed <= 0.5}
                >
                  -
                </button>
                <span className="text-white font-medium text-lg">Speed: {scrollSpeed.toFixed(1)}</span>
                <button 
                  onClick={increaseSpeed}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600 text-xl"
                  disabled={scrollSpeed >= 5}
                >
                  +
                </button>
              </div>
            )}
          </div>
          
          {/* Admin-only quit button */}
          {user?.isAdmin && (
            <Button
              onClick={handleQuitSong}
              variant="danger"
              size="lg"
              className="px-6 py-3 text-lg"
            >
              Quit
            </Button>
          )}
        </div>
      </div>
      
      {/* Scroll position indicator */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 h-32 w-1 bg-gray-700 rounded-full z-30 overflow-hidden">
        <div 
          className="absolute bottom-0 w-full bg-blue-500 rounded-full"
          style={{ 
            height: `${Math.min(100, Math.max(0, (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100))}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default LivePage;