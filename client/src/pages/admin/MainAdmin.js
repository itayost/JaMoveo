// client/src/pages/admin/MainAdmin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MainAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">JaMoveo Admin</h1>
        <p className="text-sm text-gray-400">
          Connected | Users: 0
        </p>
      </header>

      <main>
        <h2 className="text-2xl text-white mb-4">Search any song...</h2>
        
        <form onSubmit={handleSearch} className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter song title, artist, or lyrics"
            className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-500"
          />
          <button 
            type="submit"
            className="mt-2 w-full p-3 rounded bg-yellow-600 text-white font-bold hover:bg-yellow-700"
          >
            Search
          </button>
        </form>
      </main>
    </div>
  );
};

export default MainAdmin;