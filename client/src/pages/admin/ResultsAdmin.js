// client/src/pages/admin/ResultsAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock search results (will be replaced with API call)
const mockResults = [
  {
    id: '1',
    title: 'Imagine',
    artist: 'John Lennon',
    language: 'English',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Imagine_John_Lennon.jpg'
  },
  {
    id: '2',
    title: 'Yellow Submarine',
    artist: 'The Beatles',
    language: 'English',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ac/YellowSubmarineAlbum.jpg'
  },
  {
    id: '3',
    title: 'הלב שלי',
    artist: 'עברי לידר',
    language: 'Hebrew',
    imageUrl: 'https://i.ytimg.com/vi/qSA6v5jrDqU/maxresdefault.jpg'
  }
];

const ResultsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('all');
  
  // Get query from URL
  const query = new URLSearchParams(location.search).get('query') || '';

  // Fetch results (simulated API call with mock data)
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        // In a real app, this would be an API call
        const filteredResults = mockResults.filter(song => 
          song.title.toLowerCase().includes(query.toLowerCase()) || 
          song.artist.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredResults);
        setLoading(false);
      } catch (err) {
        setError('Failed to load search results. Please try again.');
        setLoading(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Filter results by language
  const filteredResults = languageFilter === 'all' 
    ? results 
    : results.filter(song => song.language === languageFilter);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleSelectSong = (songId) => {
    navigate(`/live?songId=${songId}`);
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
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="mb-8">
        <button 
          onClick={handleBack}
          className="mb-4 p-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          &#8592; Back to Search
        </button>
        <h1 className="text-2xl font-bold text-white">
          Results for &ldquo;{query}&rdquo;
        </h1>
      </header>

      {/* Filter controls */}
      <div className="mb-6">
        {/* Fix: Associate label with control using htmlFor and id */}
        <label htmlFor="language-filter" className="text-gray-300 mr-2">
          Filter by language:
        </label>
        <select
          id="language-filter"
          value={languageFilter}
          onChange={handleLanguageFilterChange}
          className="bg-gray-800 text-white p-2 rounded border border-gray-700"
        >
          <option value="all">All Languages</option>
          <option value="English">English</option>
          <option value="Hebrew">Hebrew</option>
        </select>
      </div>

      <main>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-600 text-white p-4 rounded">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="mb-2">No songs found matching &ldquo;{query}&rdquo;</p>
            {languageFilter !== 'all' && (
              <p>Try changing your language filter or search query</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredResults.map(song => (
              /* Fix: Add role, tabIndex, and onKeyDown for keyboard accessibility */
              <div 
                key={song.id}
                onClick={() => handleSelectSong(song.id)}
                onKeyDown={(e) => handleKeyDown(e, song.id)}
                role="button"
                tabIndex={0}
                aria-label={`Select song: ${song.title} by ${song.artist}`}
                className="bg-gray-800 rounded p-4 cursor-pointer hover:bg-gray-700 transition-colors"
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
                    <h3 className="text-xl font-bold text-white" dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}>
                      {song.title}
                    </h3>
                    <p className="text-gray-400" dir={song.language === 'Hebrew' ? 'rtl' : 'ltr'}>
                      {song.artist}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      song.language === 'Hebrew' ? 'bg-blue-600' : 'bg-green-600'
                    } text-white`}>
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