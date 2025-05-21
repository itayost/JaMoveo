// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { songAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
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
  const handleSelectSong = (songId) => {
    setSelectedSongId(songId);
    // Navigate to live page with song ID
    navigate(`/live?songId=${songId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 animate-fade-in">
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

        <main>
          {/* Loading state */}
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
                className="mt-4"
              >
                Refresh Page
              </Button>
            </Card>
          ) : results.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <p className="mb-4 text-xl">No songs found matching &ldquo;{query}&rdquo;</p>
              <Button
                onClick={handleBack}
                variant="primary"
                className="mt-6"
              >
                New Search
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((song) => (
                <button 
                  key={song._id}
                  onClick={() => handleSelectSong(song._id)}
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
                        <span className="text-2xl">🎵</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 
                      className="text-xl font-bold text-text-light mb-1 truncate" 
                      dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}
                    >
                      {song.title}
                    </h3>
                    <p 
                      className="text-text-muted truncate" 
                      dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}
                    >
                      {song.artist}
                    </p>
                    
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