// Simplified MainAdmin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const MainAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-md w-full p-6">
        <h1 className="text-3xl font-bold text-text-light mb-6">
          Search any song...
        </h1>
        
        <p className="text-text-muted mb-6">
          Search for a song by title, artist, or lyrics to begin the rehearsal.
        </p>
        
        <form onSubmit={handleSearch}>
          <Input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter song title, artist, or lyrics"
            className="mb-4"
          />
          <Button 
            type="submit"
            variant="primary"
            size="full"
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default MainAdmin;