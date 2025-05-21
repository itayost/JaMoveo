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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Search any song...</h1>
          
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
    </div>
  );
};

export default MainAdmin;