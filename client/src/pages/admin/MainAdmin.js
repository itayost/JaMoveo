// client/src/pages/admin/MainAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI } from '../../services/api.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const MainAdmin = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionStats, setSessionStats] = useState({
    activeUsers: 0,
    loading: true,
    error: null
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // Hooks
  const { user } = useAuth();
  const { socket, connected, currentSession, connectedUsers } = useSocket();
  const navigate = useNavigate();

  // Fetch active sessions info
  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        setSessionStats(prev => ({ ...prev, loading: true }));
        
        const response = await sessionAPI.getActiveSessions(false); // Get all sessions
        
        if (response.data.success) {
          // Process sessions data
          const sessions = response.data.sessions || [];
          
          // Get the most recent session if it exists
          if (sessions.length > 0) {
            const latestSession = sessions[0];
            
            // Update session stats
            setSessionStats({
              activeUsers: Array.isArray(connectedUsers) ? connectedUsers.length : 0,
              activeSession: latestSession,
              loading: false,
              error: null
            });
            
            // Store recent sessions
            setRecentSessions(sessions.slice(0, 5));
          } else {
            // No active sessions
            setSessionStats({
              activeUsers: 0,
              activeSession: null,
              loading: false,
              error: null
            });
            
            setRecentSessions([]);
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch session data');
        }
      } catch (error) {
        console.error('Error fetching session info:', error);
        setSessionStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load session data. Please try again.'
        }));
      }
    };
    
    fetchSessionInfo();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchSessionInfo, 30000);
    
    return () => clearInterval(intervalId);
  }, [connectedUsers]);

  // Update session stats from socket context
  useEffect(() => {
    if (currentSession) {
      setSessionStats(prev => ({
        ...prev,
        activeSession: currentSession,
        activeUsers: currentSession.connectedUsers || 0
      }));
    }
  }, [currentSession]);

  // Update active users count from socket connection
  useEffect(() => {
    if (Array.isArray(connectedUsers)) {
      setSessionStats(prev => ({
        ...prev,
        activeUsers: connectedUsers.length
      }));
    }
  }, [connectedUsers]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Create a new session
  const handleCreateSession = async () => {
    try {
      setIsCreatingSession(true);
      
      const response = await sessionAPI.createSession({
        name: `Rehearsal ${new Date().toLocaleString()}`
      });
      
      if (response.data.success) {
        setSessionStats(prev => ({
          ...prev,
          activeSession: response.data.session,
          error: null
        }));
        
        // Navigate to results page with default search to select a song
        const defaultQuery = 'imagine'; // Default search query for quick selection
        navigate(`/admin/results?query=${encodeURIComponent(defaultQuery)}`);
      } else {
        throw new Error(response.data.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setSessionStats(prev => ({
        ...prev,
        error: 'Failed to create session. Please try again.'
      }));
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Format date/time for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-light">JaMoveo Admin</h1>
        <div className="flex items-center text-sm text-text-muted mt-1">
          <div className="flex items-center mr-4">
            <span className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-success' : 'bg-error animate-pulse'}`}></span>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="flex items-center">
            <span className="mr-1">Musicians:</span>
            {sessionStats.loading ? (
              <LoadingIndicator size="sm" className="ml-1" />
            ) : (
              <span className="font-semibold">{sessionStats.activeUsers}</span>
            )}
          </div>
        </div>
      </header>

      <main className="grid gap-6 md:grid-cols-2">
        {/* Left column - Search and Session */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl text-text-light mb-4">Start Rehearsal</h2>
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
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </form>
          </Card>
          
          {/* Session Status */}
          <Card className="p-6">
            <h2 className="text-xl text-text-light mb-4">Current Session</h2>
            
            {sessionStats.loading ? (
              <div className="flex justify-center py-4">
                <LoadingIndicator size="md" />
              </div>
            ) : sessionStats.error ? (
              <div className="text-error mb-4">{sessionStats.error}</div>
            ) : sessionStats.activeSession ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-semibold">{sessionStats.activeSession.name}</span>
                    <p className="text-sm text-text-muted">
                      Started at {formatDateTime(sessionStats.activeSession.createdAt)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-success text-white">
                    Active
                  </span>
                </div>
                
                <div className="mt-2 mb-4 text-text-muted">
                  <p>
                    {sessionStats.activeUsers} {sessionStats.activeUsers === 1 ? 'musician' : 'musicians'} connected
                  </p>
                  
                  {sessionStats.activeSession.activeSong && (
                    <p className="mt-1 text-primary">
                      Now playing: {sessionStats.activeSession.activeSong.title}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button
                    onClick={() => navigate('/admin/results?query=imagine')}
                    variant="primary"
                  >
                    Select Song
                  </Button>
                  
                  <Button
                    onClick={handleCreateSession}
                    variant="secondary"
                    disabled={isCreatingSession}
                  >
                    New Session
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-text-muted mb-4">No active session. Start a new one to begin the rehearsal.</p>
                <Button
                  onClick={handleCreateSession}
                  variant="primary"
                  disabled={isCreatingSession}
                  loading={isCreatingSession}
                >
                  Create Session
                </Button>
              </div>
            )}
          </Card>
        </div>
        
        {/* Right column - Recent Sessions and Help */}
        <div className="space-y-6">
          {/* Recent Sessions */}
          <Card className="p-6">
            <h2 className="text-xl text-text-light mb-4">Recent Sessions</h2>
            
            {sessionStats.loading ? (
              <div className="flex justify-center py-4">
                <LoadingIndicator size="md" />
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map(session => (
                  <div key={session._id} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-sm text-text-muted">
                        {formatDateTime(session.createdAt)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.isActive 
                        ? 'bg-success text-white' 
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {session.isActive ? 'Active' : 'Ended'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No recent sessions found.</p>
            )}
          </Card>
          
          {/* Quick Help */}
          <Card className="p-6">
            <h2 className="text-xl text-text-light mb-4">Quick Help</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="mr-2 text-primary">🔍</span>
                <p className="text-text-muted">
                  <strong className="text-text-light">Search for songs</strong> by title, artist, or lyrics to find the perfect track for rehearsal.
                </p>
              </div>
              
              <div className="flex items-start">
                <span className="mr-2 text-primary">🎵</span>
                <p className="text-text-muted">
                  <strong className="text-text-light">Select a song</strong> from search results to display it to all connected musicians.
                </p>
              </div>
              
              <div className="flex items-start">
                <span className="mr-2 text-primary">👥</span>
                <p className="text-text-muted">
                  <strong className="text-text-light">Musicians will see</strong> content specific to their instrument - vocalists see lyrics, instrumentalists see chords and lyrics.
                </p>
              </div>
              
              <div className="flex items-start">
                <span className="mr-2 text-primary">⚙️</span>
                <p className="text-text-muted">
                  <strong className="text-text-light">Control auto-scroll</strong> to help musicians follow along hands-free during rehearsal.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MainAdmin;