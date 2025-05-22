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
    
    socket.emit('join_session', sessionId);
    
    const handleSongQuit = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        setAutoScroll(false);
      }
      navigate(user?.isAdmin ? '/admin' : '/player');
    };
    
    socket.on('song_quit', handleSongQuit);
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      socket.off('song_quit', handleSongQuit);
      socket.emit('leave_session');
    };
  }, [socket, connected, sessionId, user, navigate]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll) {
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy({
          top: 1 * scrollSpeed,
          behavior: 'auto'
        });
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          clearInterval(scrollIntervalRef.current);
          setAutoScroll(false);
        }
      }, 50);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, scrollSpeed]);

  /**
   * Render a single line with inline chords
   */
  const renderLine = (line, lineIndex) => {
    const isVocalist = user?.instrument === 'vocals';
    
    return (
      <div key={lineIndex} className="mb-6 leading-relaxed">
        <div className="flex flex-wrap items-end gap-1">
          {line.map((word, wordIndex) => (
            <div key={wordIndex} className="relative mb-2 min-h-[3rem]">
              {!isVocalist && word.chords && (
                <div className="absolute -top-7 left-0 text-yellow-300 font-mono text-lg font-bold whitespace-nowrap">
                  {word.chords}
                </div>
              )}
              
              {/* Lyrics word */}
              <span className="text-white text-2xl font-medium">
                {word.lyrics}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render song content with inline chords
   */
  const renderSongContent = () => {
    if (!song.lyricsWithChords || !Array.isArray(song.lyricsWithChords)) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-red-400">Invalid song format</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-32">
        {song.lyricsWithChords.map((line, lineIndex) => renderLine(line, lineIndex))}
      </div>
    );
  };

  // Control handlers
  const handleQuitSong = () => {
    if (!sessionId) return;
    
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      setAutoScroll(false);
    }
    
    if (socket && connected) {
      socketQuitSong(sessionId);
    } else {
      navigate(user?.isAdmin ? '/admin' : '/player');
    }
  };

  const handleToggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  const increaseSpeed = () => {
    setScrollSpeed(prev => Math.min(prev + 0.5, 5));
  };

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

  const isHebrewSong = song.language === 'Hebrew';

  return (
    <div 
      className="min-h-screen pb-24 bg-black text-white" 
      ref={contentRef}
      dir={isHebrewSong ? 'rtl' : 'ltr'}
    >
      {/* Song info header */}
      <header className="sticky top-0 z-10 bg-black shadow-lg border-b border-gray-700 mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-2 song-title">
            {song.title}
          </h1>
          <p className="text-2xl text-gray-300">
            {song.artist}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {renderSongContent()}
      </main>

      {/* Control panel */}
      <div className="fixed bottom-0 inset-x-0 py-5 px-6 bg-gray-900 shadow-lg border-t border-gray-700 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleToggleAutoScroll}
              variant={autoScroll ? 'primary' : 'secondary'}
              size="lg"
              className="px-6 py-3 text-lg"
            >
              {autoScroll ? 'Stop Auto-Scroll' : 'Auto-Scroll'}
            </Button>
            
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
    </div>
  );
};

export default LivePage;