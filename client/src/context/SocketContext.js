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
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  // Initialize socket connection when user authenticates
  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !token) {
      if (socket) {
        console.log('Disconnecting socket due to missing auth');
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
    
    console.log('Connecting to Socket.IO server at:', SOCKET_URL);

    // Create socket connection with auth token
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
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
      console.error('Socket connection error:', err.message);
      console.error('Error details:', err);
      setConnected(false);
      setError(err.message);
      
      // Check for common error cases
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
    
    // Handle user joined/left events
    newSocket.on(socketEvents.USER_JOINED, (userData) => {
      console.log('User joined:', userData);
      setConnectedUsers(prev => [...prev, {
        username: userData.username,
        instrument: userData.instrument,
        otherInstrument: userData.otherInstrument
      }]);
    });
    
    newSocket.on(socketEvents.USER_LEFT, (userData) => {
      console.log('User left:', userData);
      setConnectedUsers(prev => prev.filter(user => user.username !== userData.username));
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
      return false;
    }
    
    console.log('Emitting join_session event for session:', sessionId);
    socket.emit(socketEvents.JOIN_SESSION, sessionId);
    return true;
  }, [socket, connected]);

  /**
   * Leave the current session
   */
  const leaveSession = useCallback(() => {
    if (!socket || !connected || !currentSession) return false;
    
    console.log('Emitting leave_session event');
    socket.emit(socketEvents.LEAVE_SESSION, currentSession.id);
    setCurrentSession(null);
    setConnectedUsers([]);
    return true;
  }, [socket, connected, currentSession]);

  /**
   * Select a song for the current session (admin only)
   * @param {string} sessionId - Session ID
   * @param {string} songId - Song ID to select
   */
  const selectSong = useCallback((sessionId, songId) => {
    if (!socket || !connected) {
      setError('Cannot select song: Socket not connected');
      return false;
    }
    
    console.log(`Emitting select_song event for session ${sessionId}, song ${songId}`);
    socket.emit(socketEvents.SELECT_SONG, { sessionId, songId });
    return true;
  }, [socket, connected]);

  /**
   * End the current song display (admin only)
   * @param {string} sessionId - Session ID
   */
  const quitSong = useCallback((sessionId) => {
    if (!socket || !connected) {
      setError('Cannot quit song: Socket not connected');
      return false;
    }
    
    console.log('Emitting quit_song event for session:', sessionId);
    socket.emit(socketEvents.QUIT_SONG, sessionId);
    return true;
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
      return false;
    }
    
    console.log(`Emitting toggle_autoscroll event (${enabled ? 'on' : 'off'}, speed: ${speed})`);
    socket.emit(socketEvents.TOGGLE_AUTOSCROLL, {
      sessionId,
      enabled,
      speed
    });
    return true;
  }, [socket, connected]);

  /**
   * Broadcast current scroll position (for sync)
   * @param {string} sessionId - Session ID
   * @param {number} position - Scroll position
   */
  const updateScrollPosition = useCallback((sessionId, position) => {
    if (!socket || !connected) return false;
    
    socket.emit(socketEvents.SCROLL_POSITION, {
      sessionId,
      position
    });
    return true;
  }, [socket, connected]);

  /**
   * Manually attempt reconnection
   */
  const reconnect = useCallback(() => {
    if (!socket) return false;
    
    console.log('Manually reconnecting socket');
    socket.connect();
    return true;
  }, [socket]);

  /**
   * Get connection status details for debugging
   */
  const getConnectionStatus = useCallback(() => {
    return {
      connected,
      reconnecting,
      reconnectAttempts,
      error,
      socketId: socket?.id,
      session: currentSession,
      connectedUsers
    };
  }, [connected, reconnecting, reconnectAttempts, error, socket, currentSession, connectedUsers]);

  // Values to provide in context
  const contextValue = {
    socket,
    connected,
    reconnecting,
    reconnectAttempts,
    error,
    currentSession,
    connectedUsers,
    // Socket actions
    joinSession,
    leaveSession,
    selectSong,
    quitSong,
    toggleAutoScroll,
    updateScrollPosition,
    reconnect,
    getConnectionStatus
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;