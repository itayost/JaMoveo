// Example LivePage.js with role-based rendering
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoleBasedContent from '../../components/common/RoleBasedContent';
import AdminOnly from '../../components/common/AdminOnly';
import { useSong } from '../../hooks/useSong';
import { useSession } from '../../hooks/useSession';

const LivePage = () => {
  const { songId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { song, loading: songLoading } = useSong(songId);
  const { session, endSession } = useSession();
  const [autoScroll, setAutoScroll] = useState(false);

  // Handle quit song (admin only)
  const handleQuitSong = async () => {
    await endSession(session.id);
    navigate('/admin');
  };

  if (songLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading song...</div>;
  }

  if (!song) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Song not found</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-text-light">{song.title}</h1>
        <p className="text-xl text-text-muted">{song.artist}</p>
      </header>

      <main className="mb-16">
        {/* Role-based content rendering */}
        <RoleBasedContent
          // Vocalist view - lyrics only
          roleContent={{
            vocals: (
              <div className="lyrics-text">
                <h2 className="text-xl mb-4">Lyrics</h2>
                <pre className="whitespace-pre-line font-sans">{song.lyrics}</pre>
              </div>
            )
          }}
          // Default view for instrumentalists - chords and lyrics
          defaultContent={
            <div>
              <h2 className="text-xl mb-4">Chords</h2>
              <pre className="chord-text">{song.chords}</pre>
              <h2 className="text-xl my-4">Lyrics</h2>
              <pre className="lyrics-text">{song.lyrics}</pre>
            </div>
          }
        />
      </main>

      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`rounded-full p-4 ${
            autoScroll ? 'bg-primary' : 'bg-gray-700'
          } text-white`}
        >
          {autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}
        </button>
        
        {/* Admin-only quit button */}
        <AdminOnly>
          <button
            onClick={handleQuitSong}
            className="rounded-full p-4 bg-error text-white"
          >
            End Song
          </button>
        </AdminOnly>
      </div>
    </div>
  );
};

export default LivePage;