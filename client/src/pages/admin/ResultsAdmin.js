// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { songAPI } from '../../services/api.service';
import { sessionAPI } from '../../services/api.service';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [currentSession, setCurrentSession] = useState(null);
  
  // Get query from URL
  const query = new URLSearchParams(location.search).get('query') || '';

  // Fetch results
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await songAPI.searchSongs(query);
        setResults(response.data.songs || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (query) {
      fetchSongs();
    } else {
      setLoading(false);
    }
  }, [query]);
  
  // Get or create active session
  useEffect(() => {
    const getOrCreateSession = async () => {
      try {
        // Check for active sessions
        const response = await sessionAPI.getActiveSessions();
        
        if (response.data.sessions && response.data.sessions.length > 0) {
          // Use the most recent active session
          setCurrentSession(response.data.sessions[0]);
        } else {
          // Create a new session
          const createResponse = await sessionAPI.createSession({
            name: `Rehearsal ${new Date().toLocaleString()}`
          });
          setCurrentSession(createResponse.data.session);
        }
      } catch (err) {
        console.error('Error with session:', err);
        setError('Failed to prepare rehearsal session.');
      }
    };
    
    getOrCreateSession();
  }, []);

  // Filter results by language
  const filteredResults = languageFilter === 'all' 
    ? results 
    : results.filter(song => song.language === languageFilter);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleSelectSong = async (songId) => {
    try {
      if (!currentSession) {
        setError('No active session found. Please refresh and try again.');
        return;
      }
      
      // Emit select_song event via socket
      if (socket) {
        socket.emit('select_song', {
          sessionId: currentSession._id,
          songId
        });
      }
      
      // Navigate to live page
      navigate(`/live?songId=${songId}&sessionId=${currentSession._id}`);
    } catch (error) {
      console.error('Error selecting song:', error);
      setError('Failed to select song. Please try again.');
    }
  };

  const handleLanguageFilterChange = (e) => {
    setLanguageFilter(e.target.value);
  };

  const handleKeyDown = (e, songId) => {
    // Handle Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectSong(songId);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <button 
          onClick={handleBack}
          className="mb-4 p-2 rounded bg-surface text-text-light hover:bg-gray-700 transition-colors"
        >
          &#8592; Back to Search
        </button>
        <h1 className="text-2xl font-bold text-text-light">
          Results for &ldquo;{query}&rdquo;
        </h1>
      </header>

      {/* Filter controls */}
      <div className="mb-6">
        <label htmlFor="language-filter" className="text-text-muted mr-2">
          Filter by language:
        </label>
        <select
          id="language-filter"
          value={languageFilter}
          onChange={handleLanguageFilterChange}
          className="bg-surface text-text-light p-2 rounded border border-gray-700"
        >
          <option value="all">All Languages</option>
          <option value="English">English</option>
          <option value="Hebrew">Hebrew</option>
        </select>
      </div>

      <main>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-error bg-opacity-20 text-error p-4 rounded">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <p className="mb-2">No songs found matching &ldquo;{query}&rdquo;</p>
            {languageFilter !== 'all' && (
              <p>Try changing your language filter or search query</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredResults.map(song => (
              <div 
                key={song._id}
                onClick={() => handleSelectSong(song._id)}
                onKeyDown={(e) => handleKeyDown(e, song._id)}
                role="button"
                tabIndex={0}
                aria-label={`Select song: ${song.title} by ${song.artist}`}
                className="bg-surface rounded p-4 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start">
                  {song.imageUrl ? (
                    <img 
                      src={song.imageUrl} 
                      alt={song.title}
                      className="w-20 h-20 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-700 rounded mr-4 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-light" dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}>
                      {song.title}
                    </h3>
                    <p className="text-text-muted" dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}>
                      {song.artist}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      song.language === 'Hebrew' ? 'bg-accent' : 'bg-success'
                    } text-black`}>
                      {song.language}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsAdmin;