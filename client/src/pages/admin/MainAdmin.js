// client/src/pages/admin/MainAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const MainAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch active sessions info
  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        const response = await sessionAPI.getActiveSessions();
        if (response.data.sessions && response.data.sessions.length > 0) {
          // Get most recent session
          const latestSession = response.data.sessions[0];
          
          // If there's user count info
          if (latestSession.connectedUsers) {
            setActiveUsers(latestSession.connectedUsers.length);
          }
        }
      } catch (error) {
        console.error('Error fetching session info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionInfo();
    
    // Refresh data every 10 seconds
    const intervalId = setInterval(fetchSessionInfo, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-light">JaMoveo Admin</h1>
        <p className="text-sm text-text-muted">
          {loading ? 'Connecting...' : 'Connected'} | Users: {activeUsers}
        </p>
      </header>

      <main>
        <Card className="p-6 mb-8">
          <h2 className="text-2xl text-text-light mb-4">Welcome, {user?.username}</h2>
          <p className="text-text-muted mb-4">
            Search for a song to start the rehearsal session. The selected song will be displayed to all connected musicians based on their instrument type.
          </p>
          
          <form onSubmit={handleSearch} className="mt-6">
            <Input
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
            >
              Search
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default MainAdmin;