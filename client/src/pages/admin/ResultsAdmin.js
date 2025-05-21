// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { songAPI, sessionAPI } from '../../services/api.service';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected, selectSong } = useSocket();
  const { highContrast } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('relevance');
  const [currentSession, setCurrentSession] = useState(null);
  const [activeSessionState, setActiveSessionState] = useState({
    isCreating: false,
    error: null
  });
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
        const response = await songAPI.searchSongs(query, languageFilter !== 'all' ? languageFilter : null);
        
        if (response.data.success) {
          const songs = response.data.songs || [];
          setResults(songs);
          setFilteredResults(songs);
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
  }, [query, languageFilter]);
  
  // Apply filtering and sorting
  useEffect(() => {
    // Start with results array
    let filtered = [...results];
    
    // Apply language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(song => song.language === languageFilter);
    }
    
    // Apply sorting
    if (sortOrder === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'artist') {
      filtered.sort((a, b) => a.artist.localeCompare(b.artist));
    }
    
    setFilteredResults(filtered);
  }, [results, languageFilter, sortOrder]);
  
  // Get or create active session
  const getOrCreateSession = useCallback(async () => {
    try {
      setActiveSessionState({ isCreating: true, error: null });
      
      // Check for active sessions
      const response = await sessionAPI.getActiveSessions(true);
      
      if (response.data.success && response.data.session) {
        // Use the existing active session
        setCurrentSession(response.data.session);
      } else {
        // Create a new session
        const createResponse = await sessionAPI.createSession({
          name: `Rehearsal ${new Date().toLocaleString()}`
        });
        
        if (createResponse.data.success) {
          setCurrentSession(createResponse.data.session);
        } else {
          throw new Error(createResponse.data.message || 'Failed to create session');
        }
      }
      
      setActiveSessionState({ isCreating: false, error: null });
    } catch (err) {
      console.error('Error with session:', err);
      setActiveSessionState({ 
        isCreating: false, 
        error: 'Failed to prepare rehearsal session'
      });
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
    if (activeSessionState.isCreating || selectedSongId) {
      return; // Prevent double selection
    }
    
    try {
      // Set selected state immediately for visual feedback
      setSelectedSongId(songId);
      
      if (!currentSession) {
        // Try to get/create a session if we don't have one
        await getOrCreateSession();
        
        if (!currentSession) {
          setError('No active session found. Please refresh and try again.');
          setSelectedSongId(null);
          return;
        }
      }
      
      // Emit select_song event via socket
      if (socket && connected) {
        selectSong(currentSession._id, songId);
        
        // Short delay to allow server to process the selection
        setTimeout(() => {
          // Navigate to live page
          navigate(`/live?songId=${songId}&sessionId=${currentSession._id}`);
        }, 300);
      } else {
        // Fallback to API if socket not connected
        const session = await sessionAPI.getSession(currentSession._id);
        if (session.data.success) {
          navigate(`/live?songId=${songId}&sessionId=${currentSession._id}`);
        } else {
          throw new Error('Failed to access session');
        }
      }
    } catch (error) {
      console.error('Error selecting song:', error);
      setError('Failed to select song. Please check your connection and try again.');
      setSelectedSongId(null);
    }
  };

  // Handle language filter change
  const handleLanguageFilterChange = (e) => {
    setLanguageFilter(e.target.value);
  };

  // Handle sort order change
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Handle session retry
  const handleRetrySession = () => {
    getOrCreateSession();
  };

  return (
    <div className="min-h-screen bg-background p-4 wave-bg animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <Button 
            onClick={handleBack}
            variant="secondary"
            className="mb-4 transition-all duration-300 hover:-translate-x-1"
          >
            <span className="mr-2">←</span> Back to Search
          </Button>
          
          <h1 className="text-2xl font-bold text-text-light animate-slide-up">
            Results for &ldquo;{query}&rdquo;
          </h1>
        </header>

        {/* Filters and session status */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {/* Language filter */}
            <div className="flex items-center">
              <label htmlFor="language-filter" className="text-text-muted mr-2">
                Language:
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
            
            {/* Sort order */}
            <div className="flex items-center">
              <label htmlFor="sort-order" className="text-text-muted mr-2">
                Sort by:
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="bg-surface text-text-light p-2 rounded border border-gray-700"
              >
                <option value="relevance">Relevance</option>
                <option value="title">Song Title</option>
                <option value="artist">Artist</option>
              </select>
            </div>
          </div>
          
          {/* Session status indicator */}
          <div className="flex items-center">
            {activeSessionState.isCreating ? (
              <div className="flex items-center text-text-muted">
                <LoadingIndicator size="sm" className="mr-2" />
                Preparing session...
              </div>
            ) : activeSessionState.error ? (
              <div className="flex items-center">
                <span className="text-error mr-2">{activeSessionState.error}</span>
                <Button
                  onClick={handleRetrySession}
                  variant="secondary"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            ) : currentSession ? (
              <div className="flex items-center text-success">
                <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                Session ready
              </div>
            ) : null}
          </div>
        </div>

        <main>
          {/* Loading state with enhanced animation */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingIndicator size="lg" />
              <p className="mt-4 text-text-muted animate-pulse">Searching for songs...</p>
            </div>
          ) : error ? (
            <Card className="p-6 mb-6 bg-error bg-opacity-20 border border-error animate-fade-in">
              <p className="text-error">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="mt-4 transition-all duration-300"
              >
                Refresh Page
              </Button>
            </Card>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <p className="mb-4 text-xl">No songs found matching &ldquo;{query}&rdquo;</p>
              {languageFilter !== 'all' && (
                <p>Try changing your language filter or search for a different term</p>
              )}
              <Button
                onClick={handleBack}
                variant="primary"
                className="mt-6 transition-all duration-300"
              >
                New Search
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map((song, index) => (
                <button 
                  key={song._id}
                  onClick={() => handleSelectSong(song._id)}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    transitionDelay: `${index * 30}ms`
                  }}
                  className={`
                    text-left bg-surface rounded-lg overflow-hidden
                    shadow-lg hover:shadow-glow-light
                    transition-all duration-300 animate-fade-in
                    cursor-pointer hover:bg-gray-700 hover:-translate-y-1
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${selectedSongId === song._id ? 'ring-2 ring-primary transform scale-[0.98]' : ''}
                  `}
                  aria-label={`Select song: ${song.title} by ${song.artist}`}
                >
                  <div className="relative">
                    {song.imageUrl ? (
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-full h-40 object-cover transition-all duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-700 flex items-center justify-center text-gray-500">
                        <span className="text-2xl note-animation">🎵</span>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-gray-900 text-white shadow-md">
                      {song.language}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <h3 
                      className="text-xl font-bold text-text-light mb-1 truncate transition-all duration-300" 
                      dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}
                    >
                      {song.title}
                    </h3>
                    <p 
                      className="text-text-muted truncate transition-all duration-300" 
                      dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}
                    >
                      {song.artist}
                    </p>
                    
                    {song.year && (
                      <p className="text-text-muted text-sm mt-2">
                        Year: {song.year}
                      </p>
                    )}
                    
                    {song.genre && (
                      <p className="text-text-muted text-sm">
                        Genre: {song.genre}
                      </p>
                    )}
                    
                    {selectedSongId === song._id && (
                      <div className="mt-2 flex items-center text-primary animate-pulse">
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