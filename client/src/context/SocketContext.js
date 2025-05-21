// client/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Connect to Socket.IO server
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
    console.log('Connecting to Socket.IO server at:', SOCKET_URL);

    // Create socket connection with auth token
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setConnected(false);
    });

    // Save socket to state
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      console.log('SocketProvider unmounting - disconnecting socket');
      newSocket.disconnect();
    };
  }, [user, token]);

  // Provide socket and connection status
  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;