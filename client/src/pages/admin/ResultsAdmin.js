// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { songAPI, sessionAPI } from '../../services/api.service';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

/**
 * Results Admin Page - Displays search results and allows song selection
 */
const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected, selectSong } = useSocket();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  
  // Get query from URL
  const query = new URLSearchParams(location.search).get('query') || '';

  // Fetch results
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
          setResults(response.data.songs || []);
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
  
  // Get or create session
  const getOrCreateSession = useCallback(async () => {
    try {
      // Check for active sessions
      const response = await sessionAPI.getActiveSessions(true);
      
      if (response.data.success && response.data.session) {
        // Use the existing active session
        setSessionId(response.data.session._id);
        return response.data.session._id;
      } else {
        // Create a new session
        const createResponse = await sessionAPI.createSession({
          name: `Rehearsal ${new Date().toLocaleString()}`
        });
        
        if (createResponse.data.success) {
          setSessionId(createResponse.data.session._id);
          return createResponse.data.session._id;
        } else {
          throw new Error(createResponse.data.message || 'Failed to create session');
        }
      }
    } catch (err) {
      console.error('Error with session:', err);
      return null;
    }
  }, []);
  
  // Initialize session on component mount
  useEffect(() => {
    getOrCreateSession();
  }, [getOrCreateSession]);

  // Handle back button
  const handleBack = () => {
    navigate('/admin');
  };

  // Handle song selection
  const handleSelectSong = async (songId) => {
    if (selectedSongId) return; // Prevent double selection
    
    try {
      // Set selected state immediately for visual feedback
      setSelectedSongId(songId);
      
      // Get or create session if we don't have one
      const activeSessionId = sessionId || await getOrCreateSession();
      
      if (!activeSessionId) {
        setError('Could not create or find a session. Please try again.');
        setSelectedSongId(null);
        return;
      }
      
      // Emit socket event for song selection
      if (socket && connected) {
        selectSong(activeSessionId, songId);
        
        // Short delay to allow server to process
        setTimeout(() => {
          navigate(`/live?songId=${songId}&sessionId=${activeSessionId}`);
        }, 300);
      } else {
        // Fallback if socket not connected
        navigate(`/live?songId=${songId}&sessionId=${activeSessionId}`);
      }
    } catch (error) {
      console.error('Error selecting song:', error);
      setError('Failed to select song. Please try again.');
      setSelectedSongId(null);
    }
  };

  // Handle key press for song item
  const handleKeyPress = (e, songId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectSong(songId);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <Button 
            onClick={handleBack}
            variant="secondary"
            className="mb-4"
          >
            ← Back to Search
          </Button>
          
          <h1 className="text-2xl font-bold text-text-light">
            Results for &ldquo;{query}&rdquo;
          </h1>
        </header>

        <main>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : error ? (
            <Card className="p-6 mb-6 bg-error bg-opacity-20 border border-error">
              <p className="text-error">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="mt-4"
              >
                Refresh Page
              </Button>
            </Card>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="mb-4 text-xl">No songs found matching &ldquo;{query}&rdquo;</p>
              <Button
                onClick={handleBack}
                variant="primary"
              >
                New Search
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map(song => (
                <button 
                  key={song._id}
                  onClick={() => handleSelectSong(song._id)}
                  onKeyDown={(e) => handleKeyPress(e, song._id)}
                  className={`text-left bg-surface rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary ${
                    selectedSongId === song._id ? 'ring-2 ring-primary transform scale-[0.98]' : ''
                  }`}
                  aria-label={`Select song: ${song.title} by ${song.artist}`}
                >
                  <div className="relative">
                    {song.imageUrl ? (
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-700 flex items-center justify-center text-gray-500">
                        <span className="text-2xl">🎵</span>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-gray-900 text-white">
                      {song.language}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-text-light mb-1 truncate">
                      {song.title}
                    </h3>
                    <p className="text-text-muted truncate">
                      {song.artist}
                    </p>
                    
                    {selectedSongId === song._id && (
                      <div className="mt-2 flex items-center text-primary">
                        <LoadingIndicator size="sm" className="mr-2" />
                        Selecting...
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResultsAdmin;