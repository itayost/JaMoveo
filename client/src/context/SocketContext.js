// client/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { socketEvents } from '../services/api.service';

// Create context
const SocketContext = createContext();

/**
 * Custom hook to use socket context
 * @returns {Object} Socket context values
 */
export const useSocket = () => useContext(SocketContext);

/**
 * Socket Provider Component
 * Manages socket.io connection and provides socket instance to children
 */
export const SocketProvider = ({ children }) => {
  // Get auth state from auth context
  const { user, token } = useAuth();
  
  // Socket state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
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

    // Get socket URL from environment or use explicit backend URL
    // IMPORTANT FIX: Use explicit backend URL instead of window.location.origin
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
    
    console.log('Connecting to Socket.IO server at:', SOCKET_URL);

    // Create socket connection with auth token
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // ADDED: Additional options to help with CORS/connection issues
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
      setConnected(true);
      setReconnecting(false);
      setReconnectAttempts(0);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      // IMPROVED: More detailed error logging
      console.error('Socket connection error:', err.message);
      console.error('Error details:', err);
      setConnected(false);
      setError(err.message);
      
      // ADDED: Check for common error cases
      if (err.message.includes('xhr poll error')) {
        console.warn('This may be a CORS issue or the server is not running.');
      } else if (err.message.includes('Invalid token')) {
        console.warn('Authentication token may be invalid or expired.');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, likely due to authentication issue
        setError('Disconnected by server. Please log in again.');
      }
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
      setReconnecting(true);
      setReconnectAttempts(attemptNumber);
    });
    
    newSocket.io.on('reconnect_failed', () => {
      console.log('Socket reconnection failed after all attempts');
      setReconnecting(false);
      setError('Unable to connect to server. Please check your connection and refresh the page.');
    });
    
    // Session-related events
    newSocket.on(socketEvents.SESSION_STATE, (sessionData) => {
      console.log('Received session state:', sessionData);
      setCurrentSession(sessionData);
    });
    
    newSocket.on(socketEvents.ERROR, (errorData) => {
      console.error('Socket error:', errorData);
      setError(errorData.message || 'An error occurred');
    });

    // Save socket to state
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      console.log('SocketProvider unmounting - disconnecting socket');
      newSocket.disconnect();
    };
  }, [user, token]);

  /**
   * Join a rehearsal session
   * @param {string} sessionId - ID of the session to join
   */
  const joinSession = useCallback((sessionId) => {
    if (!socket || !connected) {
      setError('Cannot join session: Socket not connected');
      return;
    }
    
    socket.emit(socketEvents.JOIN_SESSION, sessionId);
  }, [socket, connected]);

  /**
   * Leave the current session
   */
  const leaveSession = useCallback(() => {
    if (!socket || !connected || !currentSession) return;
    
    socket.emit(socketEvents.LEAVE_SESSION, currentSession.id);
    setCurrentSession(null);
  }, [socket, connected, currentSession]);

  /**
   * Select a song for the current session (admin only)
   * @param {string} sessionId - Session ID
   * @param {string} songId - Song ID to select
   */
  const selectSong = useCallback((sessionId, songId) => {
    if (!socket || !connected) {
      setError('Cannot select song: Socket not connected');
      return;
    }
    
    socket.emit(socketEvents.SELECT_SONG, { sessionId, songId });
  }, [socket, connected]);

  /**
   * End the current song display (admin only)
   * @param {string} sessionId - Session ID
   */
  const quitSong = useCallback((sessionId) => {
    if (!socket || !connected) {
      setError('Cannot quit song: Socket not connected');
      return;
    }
    
    socket.emit(socketEvents.QUIT_SONG, sessionId);
  }, [socket, connected]);

  /**
   * Toggle auto-scroll state in the current session
   * @param {string} sessionId - Session ID
   * @param {boolean} enabled - Whether auto-scroll is enabled
   * @param {number} [speed=1] - Scroll speed
   */
  const toggleAutoScroll = useCallback((sessionId, enabled, speed = 1) => {
    if (!socket || !connected) {
      setError('Cannot toggle auto-scroll: Socket not connected');
      return;
    }
    
    socket.emit(socketEvents.TOGGLE_AUTOSCROLL, {
      sessionId,
      enabled,
      speed
    });
  }, [socket, connected]);

  /**
   * Broadcast current scroll position (for sync)
   * @param {string} sessionId - Session ID
   * @param {number} position - Scroll position
   */
  const updateScrollPosition = useCallback((sessionId, position) => {
    if (!socket || !connected) return;
    
    socket.emit(socketEvents.SCROLL_POSITION, {
      sessionId,
      position
    });
  }, [socket, connected]);

  /**
   * Manually attempt reconnection
   */
  const reconnect = useCallback(() => {
    if (!socket) return;
    
    socket.connect();
  }, [socket]);

  // ADDED: Method to help debug connection issues
  const checkConnectionStatus = useCallback(() => {
    console.log('Current socket:', socket);
    console.log('Connected:', connected);
    console.log('Current user:', user);
    console.log('Auth token exists:', !!token);
    
    if (socket) {
      console.log('Socket ID:', socket.id);
      console.log('Socket connected:', socket.connected);
      console.log('Socket disconnected:', socket.disconnected);
    }
    
    return {
      socket: !!socket,
      connected,
      user: !!user,
      token: !!token,
      socketDetails: socket ? {
        id: socket.id,
        connected: socket.connected,
        disconnected: socket.disconnected
      } : null
    };
  }, [socket, connected, user, token]);

  // Values to provide in context
  const contextValue = {
    socket,
    connected,
    reconnecting,
    reconnectAttempts,
    error,
    currentSession,
    // Socket actions
    joinSession,
    leaveSession,
    selectSong,
    quitSong,
    toggleAutoScroll,
    updateScrollPosition,
    reconnect,
    // Debug helpers
    checkConnectionStatus
  };

  // Provide a fallback UI when the socket fails to connect in development
  // This helps with development when the backend is not running
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment && error && !connected && !socket && user) {
    console.log('Rendering socket connection error UI');
    return (
      <SocketContext.Provider value={contextValue}>
        {children}
      </SocketContext.Provider>
    );
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;