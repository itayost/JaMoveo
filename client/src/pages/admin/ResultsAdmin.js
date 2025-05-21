// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { songAPI, sessionAPI } from '../../services/api.service';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SongCard from '../../components/songs/SongCard';
import { LoadingIndicator, Skeleton } from '../../components/ui/LoadingComponents';

/**
 * ResultsAdmin displays search results and allows admin to select a song for rehearsal
 * Enhanced with better styling, accessibility, and smoky environment optimizations
 */
const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected } = useSocket();
  const { highContrast, fontSize } = useTheme();
  
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
    // 'relevance' sorting is handled by the backend
    
    setFilteredResults(filtered);
  }, [results, languageFilter, sortOrder]);
  
  // Get or create active session
  const getOrCreateSession = useCallback(async () => {
    try {
      setActiveSessionState({ isCreating: true, error: null });
      
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

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin');
  };

  // Handle song selection with improved feedback
  const handleSelectSong = async (songId) => {
    if (activeSessionState.isCreating) {
      return; // Do nothing if we're still creating a session
    }
    
    // Set selected song ID for visual feedback
    setSelectedSongId(songId);
    
    try {
      if (!currentSession) {
        // Try to get/create a session if we don't have one
        await getOrCreateSession();
        
        if (!currentSession) {
          setError('No active session found. Please refresh and try again.');
          return;
        }
      }
      
      // Emit select_song event via socket
      if (socket && connected) {
        // Show loading feedback for selection
        setActiveSessionState(prev => ({ ...prev, isCreating: true }));
        
        socket.emit('select_song', {
          sessionId: currentSession._id,
          songId
        });
        
        // Navigate to live page
        navigate(`/live?songId=${songId}&sessionId=${currentSession._id}`);
      } else {
        throw new Error('Socket connection not available');
      }
    } catch (error) {
      console.error('Error selecting song:', error);
      setError('Failed to select song. Please check your connection and try again.');
      setSelectedSongId(null); // Clear selection on error
      setActiveSessionState(prev => ({ ...prev, isCreating: false }));
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

  // Handle retry session creation
  const handleRetrySession = () => {
    getOrCreateSession();
  };

  // Get font size class for responsive text
  const fontSizeClass = {
    'normal': 'text-base',
    'large': 'text-lg',
    'x-large': 'text-xl'
  }[fontSize] || 'text-base';

  return (
    <div className={`min-h-screen bg-background p-4 ${highContrast ? 'high-contrast' : ''}`}>
      <div className="container mx-auto max-w-6xl">
        {/* Page header with back button and title */}
        <header className="mb-8 animate-fade-in">
          <Button 
            onClick={handleBack}
            variant="ghost"
            className="mb-4 flex items-center group"
            iconLeft={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            }
          >
            Back to Search
          </Button>
          
          <h1 className={`text-2xl md:text-3xl font-bold text-text-light ${fontSizeClass}`}>
            Results for <span className="text-primary">&ldquo;{query}&rdquo;</span>
          </h1>
        </header>

        {/* Filters and session status bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <Card variant="elevated" className="w-full md:w-auto p-4">
            <div className="flex flex-wrap gap-4">
              {/* Language filter */}
              <div className="flex flex-col">
                <label htmlFor="language-filter" className={`text-text-light mb-2 font-medium ${fontSizeClass}`}>
                  Language
                </label>
                <div className="flex space-x-2">
                  {['all', 'English', 'Hebrew'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguageFilter(lang)}
                      className={`px-3 py-1.5 rounded-full border font-medium transition-colors
                        ${languageFilter === lang 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-elevated text-text-muted border-gray-700 hover:bg-gray-700'
                        }
                        ${fontSizeClass}
                      `}
                    >
                      {lang === 'all' ? 'All' : lang}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sort order */}
              <div className="flex flex-col">
                <label htmlFor="sort-order" className={`text-text-light mb-2 font-medium ${fontSizeClass}`}>
                  Sort by
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className={`bg-surface-elevated text-text-light p-2 rounded border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary ${fontSizeClass}`}
                >
                  <option value="relevance">Relevance</option>
                  <option value="title">Song Title</option>
                  <option value="artist">Artist</option>
                </select>
              </div>
            </div>
          </Card>
          
          {/* Session status indicator */}
          <Card variant={currentSession ? 'success' : activeSessionState.error ? 'error' : 'primary'} className="w-full md:w-auto p-4">
            <div className="flex items-center">
              {activeSessionState.isCreating ? (
                <>
                  <LoadingIndicator size="sm" className="mr-3" />
                  <span className={`text-text-light ${fontSizeClass}`}>Preparing session...</span>
                </>
              ) : activeSessionState.error ? (
                <>
                  <span className={`text-error mr-3 ${fontSizeClass}`}>{activeSessionState.error}</span>
                  <Button
                    onClick={handleRetrySession}
                    variant="primary"
                    size="sm"
                  >
                    Retry
                  </Button>
                </>
              ) : currentSession ? (
                <>
                  <div className="w-3 h-3 bg-success rounded-full mr-3 animate-pulse"></div>
                  <span className={`text-text-light font-medium ${fontSizeClass}`}>Session ready</span>
                </>
              ) : null}
            </div>
          </Card>
        </div>

        {/* Main content area with results */}
        <main className="animate-fade-in">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, index) => (
                <Skeleton 
                  key={`skeleton-${index}`} 
                  type="song-card" 
                />
              ))}
            </div>
          ) : error ? (
            <Card variant="error" className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Error Loading Results</h2>
              <p className="text-error mb-4">{error}</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={handleBack}
                  variant="secondary"
                >
                  Back to Search
                </Button>
              </div>
            </Card>
          ) : filteredResults.length === 0 ? (
            <Card variant="elevated" className="p-8 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className={`text-xl font-semibold mb-3 ${fontSizeClass}`}>No songs found</h2>
              <p className={`text-text-muted mb-6 ${fontSizeClass}`}>
                No songs found matching <span className="text-primary">&ldquo;{query}&rdquo;</span>
                {languageFilter !== 'all' && (
                  <> in {languageFilter}</>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {languageFilter !== 'all' && (
                  <Button
                    onClick={() => setLanguageFilter('all')}
                    variant="secondary"
                  >
                    Show All Languages
                  </Button>
                )}
                <Button
                  onClick={handleBack}
                  variant="primary"
                >
                  New Search
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map(song => (
                <SongCard
                  key={song._id}
                  song={song}
                  onSelect={handleSelectSong}
                  selected={selectedSongId === song._id}
                />
              ))}
            </div>
          )}
          
          {/* Results count */}
          {!loading && !error && filteredResults.length > 0 && (
            <div className="mt-6 text-center text-text-muted">
              Showing {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              {languageFilter !== 'all' ? ` in ${languageFilter}` : ''}
            </div>
          )}
        </main>
        
        {/* Selection instructions */}
        {!loading && !error && filteredResults.length > 0 && (
          <div className="text-center mt-8 mb-6 p-4 border border-gray-700 rounded-lg bg-surface-elevated">
            <p className={`text-text-light ${fontSizeClass}`}>
              Select a song to start the rehearsal. All connected musicians will see the selected song.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsAdmin;