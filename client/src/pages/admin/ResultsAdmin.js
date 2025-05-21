// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { songAPI, sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected, selectSong } = useSocket();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  
  // Get query from URL
  const query = new URLSearchParams(location.search).get('query') || '';

  // Get the current active session
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await sessionAPI.getActiveSessions(true);
        
        if (response.data.success && response.data.session) {
          setActiveSession(response.data.session);
        } else {
          // Create a session if none exists
          const createRes = await sessionAPI.createSession();
          if (createRes.data.success) {
            setActiveSession(createRes.data.session);
          } else {
            setError('Failed to create a session');
          }
        }
      } catch (err) {
        console.error('Error with session:', err);
        setError('Error with rehearsal session');
      }
    };
    
    fetchActiveSession();
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchSongs = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await songAPI.searchSongs(query);
        
        if (response.data.success) {
          const songs = response.data.songs || [];
          setResults(songs);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to load search results');
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSongs();
  }, [query]);

  // Handle back button
  const handleBack = () => {
    navigate('/admin');
  };

  // Handle song selection
  const handleSelectSong = async (songId) => {
    setSelectedSongId(songId);
    
    try {
      // Emit socket event if connected
      if (socket && connected && activeSession) {
        selectSong(activeSession._id, songId);
      }
      
      // Navigate to live page with song and session ID
      navigate(`/live?songId=${songId}&sessionId=${activeSession?._id}`);
    } catch (error) {
      console.error('Error selecting song:', error);
      setError('Failed to select song. Please try again.');
      setSelectedSongId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <Button 
          onClick={handleBack}
          variant="secondary"
          className="mb-4"
        >
          ← Back to Search
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">
          Results for &quot;{query}&quot;
        </h1>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingIndicator size="lg" />
            <p className="mt-4 text-gray-400">Searching for songs...</p>
          </div>
        ) : error ? (
          <Card className="p-6 mb-6 bg-error/20 border border-error">
            <p className="text-error">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              className="mt-4"
            >
              Retry
            </Button>
          </Card>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">No songs found matching &quot;{query}&quot;</p>
            <Button
              onClick={handleBack}
              variant="primary"
            >
              Try Another Search
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((song) => (
              <Card 
                key={song._id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleSelectSong(song._id)}
              >
                {song.imageUrl && (
                  <img 
                    src={song.imageUrl} 
                    alt={song.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1" dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}>
                    {song.title}
                  </h3>
                  <p className="text-gray-400" dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}>
                    {song.artist}
                  </p>
                  
                  {selectedSongId === song._id && (
                    <div className="mt-2 flex items-center text-primary animate-pulse">
                      <LoadingIndicator size="sm" className="mr-2" />
                      Selecting...
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsAdmin;