// client/src/hooks/useSession.js (updated)
import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useSession = (sessionId = null) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch session by ID if provided
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        
        // Fetch session data using API utility
        const response = await api.get(`/sessions/${sessionId}`);
        
        if (response.data.success) {
          setSession(response.data.session);
        } else {
          setError(response.data.message || 'Failed to load session');
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err.response?.data?.message || 'Error loading session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Create a new session
  const createSession = async (sessionData = {}) => {
    try {
      const response = await api.post('/sessions', sessionData);
      
      if (response.data.success) {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  // Join an existing session
  const joinSession = async (id) => {
    if (!id) throw new Error('Session ID required');
    
    try {
      const response = await api.post(`/sessions/${id}/join`);
      
      if (response.data.success) {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to join session');
      }
    } catch (err) {
      console.error('Error joining session:', err);
      throw err;
    }
  };

  // End a session (admin only)
  const endSession = async (id) => {
    if (!id) throw new Error('Session ID required');
    
    try {
      const response = await api.post(`/sessions/${id}/end`);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to end session');
      }
    } catch (err) {
      console.error('Error ending session:', err);
      throw err;
    }
  };

  // Leave a session
  const leaveSession = async (id) => {
    if (!id) throw new Error('Session ID required');
    
    try {
      const response = await api.post(`/sessions/${id}/leave`);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to leave session');
      }
    } catch (err) {
      console.error('Error leaving session:', err);
      throw err;
    }
  };

  // Return hook data and functions
  return {
    session,
    loading,
    error,
    createSession,
    joinSession,
    endSession,
    leaveSession
  };
};