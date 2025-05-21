// client/src/hooks/useSession.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { sessionAPI, errorUtils, socketEvents } from '../services/api.service';

/**
 * Custom hook for managing rehearsal sessions
 * @param {string} [initialSessionId] - Optional initial session ID to load
 * @returns {Object} Session management methods and state
 */
export const useSession = (initialSessionId = null) => {
  // State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialSessionId));
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Get socket context
  const { 
    socket, 
    connected, 
    currentSession,
    joinSession: socketJoinSession
  } = useSocket();

  // Sync with socket's currentSession when it changes
  useEffect(() => {
    if (currentSession) {
      setSession(currentSession);
      
      // Update users list if available
      if (currentSession.connectedUsers) {
        setUsers(
          Array.isArray(currentSession.connectedUsers) 
            ? currentSession.connectedUsers 
            : []
        );
      }
    }
  }, [currentSession]);

  // Fetch session by ID (HTTP)
  const fetchSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch session data using API
      const response = await sessionAPI.getSession(sessionId);
      
      if (response.data.success) {
        const sessionData = response.data.session;
        setSession(sessionData);
        
        // Update users list
        if (sessionData.connectedUsers) {
          setUsers(sessionData.connectedUsers);
        }
      } else {
        setError(response.data.message || 'Failed to load session');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(errorUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial session if provided
  useEffect(() => {
    if (initialSessionId) {
      fetchSession(initialSessionId);
    }
  }, [initialSessionId, fetchSession]);

  // Set up socket listeners for user events
  useEffect(() => {
    if (!socket || !connected) return;
    
    // Handle user join event
    const handleUserJoined = (userData) => {
      // Add user to the list if not already present
      setUsers(prevUsers => {
        // Check if user already exists
        const userExists = prevUsers.some(u => 
          u.user.username === userData.username
        );
        
        if (userExists) return prevUsers;
        
        // Add new user
        return [...prevUsers, {
          user: {
            username: userData.username,
            instrument: userData.instrument,
            otherInstrument: userData.otherInstrument
          },
          joinedAt: new Date().toISOString()
        }];
      });
    };
    
    // Handle user leave event
    const handleUserLeft = (userData) => {
      // Remove user from the list
      setUsers(prevUsers => 
        prevUsers.filter(u => u.user.username !== userData.username)
      );
    };
    
    // Register event handlers
    socket.on(socketEvents.USER_JOINED, handleUserJoined);
    socket.on(socketEvents.USER_LEFT, handleUserLeft);
    
    return () => {
      // Clean up event handlers
      socket.off(socketEvents.USER_JOINED, handleUserJoined);
      socket.off(socketEvents.USER_LEFT, handleUserLeft);
    };
  }, [socket, connected]);

  /**
   * Get all active sessions 
   * @param {boolean} [latest=true] - If true, returns only the most recent session
   * @returns {Promise<Object>} The active session(s) or null
   */
  const getActiveSessions = useCallback(async (latest = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionAPI.getActiveSessions(latest);
      
      if (response.data.success) {
        // Response format depends on 'latest' parameter
        const result = latest 
          ? response.data.session
          : response.data.sessions;
        
        return result;
      } else {
        setError(response.data.message || 'Failed to get active sessions');
        return null;
      }
    } catch (err) {
      console.error('Error getting active sessions:', err);
      setError(errorUtils.getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new session (admin only)
   * @param {Object} [sessionData={}] - Session data
   * @returns {Promise<Object|null>} Created session or null on error
   */
  const createSession = useCallback(async (sessionData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionAPI.createSession(sessionData);
      
      if (response.data.success) {
        const newSession = response.data.session;
        setSession(newSession);
        return newSession;
      } else {
        setError(response.data.message || 'Failed to create session');
        return null;
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError(errorUtils.getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Join a session - both HTTP API and socket
   * @param {string} sessionId - Session ID to join
   * @returns {Promise<boolean>} Success status
   */
  const joinSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      setError('Session ID is required');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Join via HTTP API first
      const response = await sessionAPI.joinSession(sessionId);
      
      if (response.data.success) {
        const sessionData = response.data.session;
        setSession(sessionData);
        
        // Then join via Socket.io if connected
        if (socket && connected) {
          socketJoinSession(sessionId);
        }
        
        return true;
      } else {
        setError(response.data.message || 'Failed to join session');
        return false;
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setError(errorUtils.getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [socket, connected, socketJoinSession]);

  /**
   * End a session (admin only)
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} Success status
   */
  const endSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      setError('Session ID is required');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionAPI.endSession(sessionId);
      
      if (response.data.success) {
        // If we're in this session, clear it
        if (session && session.id === sessionId) {
          setSession(null);
        }
        
        return true;
      } else {
        setError(response.data.message || 'Failed to end session');
        return false;
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError(errorUtils.getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Return session state and methods
  return {
    // State
    session,
    loading,
    error,
    users,
    
    // Methods
    fetchSession,
    getActiveSessions,
    createSession,
    joinSession,
    endSession
  };
};

export default useSession;