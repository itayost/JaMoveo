import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext();

/**
 * Custom hook to use socket context
 */
export const useSocket = () => useContext(SocketContext);

/**
 * Simplified Socket Provider Component
 */
export const SocketProvider = ({ children }) => {
  // Get auth state from auth context
  const { user, token } = useAuth();
  
  // Socket state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  
  // Current session state
  const [currentSession, setCurrentSession] = useState(null);
  
  // Initialize socket connection when user authenticates
  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
        setCurrentSession(null);
      }
      return;
    }

    // Get socket URL from environment or use default
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || (
      window.location.hostname === 'localhost' 
        ? 'http://localhost:5001' 
        : window.location.origin
    );

    // Create socket connection with auth token
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      setConnected(false);
      setError('Connection error');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });
    
    // Session-related events
    newSocket.on('session_state', (sessionData) => {
      setCurrentSession(sessionData);
    });

    // Save socket to state
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  /**
   * Join a rehearsal session
   */
  const joinSession = useCallback((sessionId) => {
    if (!socket || !connected) return false;
    
    socket.emit('join_session', sessionId);
    return true;
  }, [socket, connected]);

  /**
   * Leave the current session
   */
  const leaveSession = useCallback(() => {
    if (!socket || !connected || !currentSession) return false;
    
    socket.emit('leave_session');
    setCurrentSession(null);
    return true;
  }, [socket, connected, currentSession]);

  /**
   * Select a song for the current session (admin only)
   */
  const selectSong = useCallback((sessionId, songId) => {
    if (!socket || !connected) return false;
    
    socket.emit('select_song', { sessionId, songId });
    return true;
  }, [socket, connected]);

  /**
   * End the current song display (admin only)
   */
  const quitSong = useCallback((sessionId) => {
    if (!socket || !connected) return false;
    
    socket.emit('quit_song', sessionId);
    return true;
  }, [socket, connected]);

  /**
   * Toggle auto-scroll state in the current session
   */
  const toggleAutoScroll = useCallback((sessionId, enabled) => {
    if (!socket || !connected) return false;
    
    socket.emit('toggle_autoscroll', {
      sessionId,
      enabled
    });
    return true;
  }, [socket, connected]);

  // Values to provide in context
  const contextValue = {
    socket,
    connected,
    error,
    currentSession,
    // Socket actions
    joinSession,
    leaveSession,
    selectSong,
    quitSong,
    toggleAutoScroll
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;