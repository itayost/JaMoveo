// client/src/pages/LivePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBasedContent from '../components/shared/RoleBasedContent';
import AdminOnly from '../components/shared/AdminOnly';
import { useSong } from '../hooks/useSong';
import { useSession } from '../hooks/useSession';
import { useSocket } from '../context/SocketContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LivePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  // Get query parameters
  const searchParams = new URLSearchParams(location.search);
  const songId = searchParams.get('songId');
  const sessionId = searchParams.get('sessionId');
  
  const { song, loading: songLoading } = useSong(songId);
  const { endSession } = useSession();
  
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);

  // Handle auto-scroll effect
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      window.scrollBy({
        top: scrollSpeed,
        behavior: 'smooth'
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !sessionId) return;
    
    // Join session room
    socket.emit('join_session', sessionId);
    
    // Listen for song_quit event
    const handleSongQuit = () => {
      navigate(user?.isAdmin ? '/admin' : '/player');
    };
    
    socket.on('song_quit', handleSongQuit);
    
    // Cleanup listener when component unmounts
    return () => {
      socket.off('song_quit', handleSongQuit);
      socket.emit('leave_session');
    };
  }, [socket, sessionId, user, navigate]);

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
      }
      navigate('/admin');
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Handle auto-scroll toggle
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

  if (songLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading song...</div>;
  }

  if (!song) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Song not found</div>;
  }

  // Set appropriate text direction based on language
  const textDirection = song.language === 'Hebrew' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen p-4 bg-background">
      <header className="mb-6" dir={textDirection}>
        <h1 className="text-3xl font-bold text-text-light">{song.title}</h1>
        <p className="text-xl text-text-muted">{song.artist}</p>
      </header>

      <main className="mb-16">
        {/* Role-based content rendering */}
        <RoleBasedContent
          // Admin view - complete content with controls
          adminContent={
            <div>
              <h2 className="text-xl mb-4">Chords & Lyrics</h2>
              <div className="mb-4 p-2 bg-surface rounded">
                <pre className="chord-text whitespace-pre-line font-mono">{song.chords}</pre>
              </div>
              <h2 className="text-xl my-4">Lyrics</h2>
              <div dir={textDirection}>
                <pre className="lyrics-text whitespace-pre-line">{song.lyrics}</pre>
              </div>
            </div>
          }
          
          // Vocalist view - lyrics only
          roleContent={{
            vocals: (
              <div dir={textDirection} className="lyrics-text">
                <h2 className="text-xl mb-4">Lyrics</h2>
                <pre className="whitespace-pre-line font-sans text-xl">{song.lyrics}</pre>
              </div>
            )
          }}
          
          // Default view for instrumentalists - chords and lyrics
          defaultContent={
            <div>
              <h2 className="text-xl mb-4">Chords</h2>
              <pre className="chord-text whitespace-pre-line font-mono">{song.chords}</pre>
              <h2 className="text-xl my-4">Lyrics</h2>
              <div dir={textDirection}>
                <pre className="lyrics-text whitespace-pre-line">{song.lyrics}</pre>
              </div>
            </div>
          }
        />
      </main>

      <div className="fixed bottom-4 right-4 flex gap-2">
        <Card className="p-2 flex flex-col gap-2">
          <Button
            onClick={toggleAutoScroll}
            variant={autoScroll ? 'primary' : 'secondary'}
            className="rounded-full"
          >
            {autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}
          </Button>
          
          {autoScroll && (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => setScrollSpeed(Math.max(0.5, scrollSpeed - 0.5))}
                disabled={scrollSpeed <= 0.5}
              >
                Slower
              </Button>
              <Button 
                size="sm"
                onClick={() => setScrollSpeed(scrollSpeed + 0.5)}
              >
                Faster
              </Button>
            </div>
          )}
        </Card>
        
        {/* Admin-only quit button */}
        <AdminOnly>
          <Button
            onClick={handleQuitSong}
            variant="danger"
            className="rounded-full"
          >
            End Song
          </Button>
        </AdminOnly>
      </div>
    </div>
  );
};

export default LivePage;