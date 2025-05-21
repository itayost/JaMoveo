// client/src/context/SocketContext.js
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
 * Socket Provider Component
 */
export const SocketProvider = ({ children }) => {
  // Get auth state from auth context
  const { user, token } = useAuth();
  
  // Socket state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  
  // Current session state
  const [currentSession, setCurrentSession] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  // Initialize socket connection when user authenticates
  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
        setCurrentSession(null);
        setConnectedUsers([]);
      }
      return;
    }

    // Get socket URL from environment or use default
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || (
      window.location.hostname === 'localhost' 
        ? 'http://localhost:5001' 
        : window.location.origin
    );

    console.log(`Connecting to socket server at ${SOCKET_URL}`);

    // Create socket connection with auth token
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      setReconnecting(false);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
      setError(`Connection error: ${err.message}`);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnection attempt ${attempt}`);
      setReconnecting(true);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
      setConnected(true);
      setReconnecting(false);
      setError(null);
    });

    newSocket.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err.message);
      setError(`Reconnection error: ${err.message}`);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setReconnecting(false);
      setError('Failed to reconnect to server. Please refresh the page.');
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setConnected(false);
      
      // If server disconnected us, don't attempt to reconnect automatically
      if (reason === 'io server disconnect') {
        setError('Disconnected by server. Please refresh the page.');
      } else {
        setError('Connection lost. Attempting to reconnect...');
      }
    });
    
    // Session-related events
    newSocket.on('session_state', (sessionData) => {
      console.log('Received session state:', sessionData);
      setCurrentSession(sessionData);
    });

    newSocket.on('user_joined', (userData) => {
      console.log('User joined:', userData);
      setConnectedUsers(prev => {
        if (prev.some(u => u.username === userData.username)) {
          return prev;
        }
        return [...prev, userData];
      });
    });

    newSocket.on('user_left', (userData) => {
      console.log('User left:', userData);
      setConnectedUsers(prev => 
        prev.filter(u => u.username !== userData.username)
      );
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'An error occurred');
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
    if (!socket || !connected) {
      console.error('Cannot join session: Socket not connected');
      return false;
    }
    
    console.log(`Joining session: ${sessionId}`);
    socket.emit('join_session', sessionId);
    return true;
  }, [socket, connected]);

  /**
   * Leave the current session
   */
  const leaveSession = useCallback(() => {
    if (!socket || !connected || !currentSession) {
      console.error('Cannot leave session: Socket not connected or no active session');
      return false;
    }
    
    console.log('Leaving current session');
    socket.emit('leave_session');
    setCurrentSession(null);
    return true;
  }, [socket, connected, currentSession]);

  /**
   * Select a song for the current session (admin only)
   */
  const selectSong = useCallback((sessionId, songId) => {
    if (!socket || !connected) {
      console.error('Cannot select song: Socket not connected');
      return false;
    }
    
    console.log(`Selecting song ${songId} for session ${sessionId}`);
    socket.emit('select_song', { sessionId, songId });
    return true;
  }, [socket, connected]);

  /**
   * End the current song display (admin only)
   */
  const quitSong = useCallback((sessionId) => {
    if (!socket || !connected) {
      console.error('Cannot quit song: Socket not connected');
      return false;
    }
    
    console.log(`Quitting song for session ${sessionId}`);
    socket.emit('quit_song', sessionId);
    return true;
  }, [socket, connected]);

  /**
   * Toggle auto-scroll state in the current session
   */
  const toggleAutoScroll = useCallback((sessionId, enabled, speed = 1) => {
    if (!socket || !connected) {
      console.error('Cannot toggle auto-scroll: Socket not connected');
      return false;
    }
    
    console.log(`Toggling auto-scroll (${enabled ? 'enabled' : 'disabled'}) for session ${sessionId}`);
    socket.emit('toggle_autoscroll', {
      sessionId,
      enabled,
      speed
    });
    return true;
  }, [socket, connected]);

  // Values to provide in context
  const contextValue = {
    socket,
    connected,
    error,
    reconnecting,
    currentSession,
    connectedUsers,
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