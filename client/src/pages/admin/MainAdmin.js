// client/src/pages/admin/MainAdmin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const MainAdmin = () => {
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 wave-bg animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-text-light instrument-accent">
            Search any song...
          </h1>
        </header>

        <Card className="p-6 mb-6 shadow-lg hover:shadow-glow-light transition-all duration-300">
          <p className="text-text-muted mb-6 animate-fade-in">
            Search for a song to start the rehearsal session.
          </p>
          
          <form 
            onSubmit={handleSearch}
            className="animate-slide-up"
          >
            <Input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter song title, artist, or lyrics"
              className="mb-4 transition-all duration-300 focus:shadow-glow-light"
            />
            <Button 
              type="submit"
              variant="primary"
              disabled={!searchQuery.trim()}
              className="w-full transition-all duration-300 hover:shadow-glow"
            >
              Search
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default MainAdmin;