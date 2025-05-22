// server/socket/index.js - Simplified Version
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const Song = require('../models/song.model');

/**
 * Setup Socket.io server with simplified functionality
 * @param {Object} server - HTTP server instance
 * @returns {Object} Configured Socket.io instance
 */
const setupSocket = (server) => {
  // Initialize Socket.io with basic CORS
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = {
        id: user._id,
        username: user.username,
        instrument: user.instrument,
        isAdmin: user.isAdmin
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Join session
    socket.on('join_session', async (sessionId) => {
      try {
        // Find and validate session
        const session = await Session.findById(sessionId)
          .populate('admin', 'username')
          .populate('activeSong', 'title artist language');
        
        if (!session || !session.isActive) {
          socket.emit('error', { message: 'Session not found or inactive' });
          return;
        }
        
        // Join socket room
        socket.join(sessionId);
        socket.sessionId = sessionId;
        
        // Add user to session
        await session.addUser(socket.user.id, socket.id);
        
        // Notify others
        socket.to(sessionId).emit('user_joined', {
          username: socket.user.username,
          instrument: socket.user.instrument
        });
        
        // Send session state to new user
        socket.emit('session_state', {
          id: session._id,
          name: session.name,
          admin: session.admin,
          activeSong: session.activeSong
        });
        
        console.log(`${socket.user.username} joined session ${sessionId}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });
    
    // Leave session
    socket.on('leave_session', async () => {
      if (!socket.sessionId) return;
      
      try {
        const session = await Session.findById(socket.sessionId);
        
        if (session) {
          await session.removeUser(socket.user.id);
          
          socket.to(socket.sessionId).emit('user_left', {
            username: socket.user.username
          });
          
          socket.leave(socket.sessionId);
          console.log(`${socket.user.username} left session ${socket.sessionId}`);
          socket.sessionId = null;
        }
      } catch (error) {
        console.error('Error leaving session:', error);
      }
    });
    
    // Admin selects a song
    socket.on('select_song', async (data) => {
      try {
        const { sessionId, songId } = data;
        
        // Verify user is admin
        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Admin privileges required' });
          return;
        }
        
        // Validate session and song
        const session = await Session.findById(sessionId);
        const song = await Song.findById(songId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        if (!song) {
          socket.emit('error', { message: 'Song not found' });
          return;
        }
        
        // Set active song
        await session.setActiveSong(songId);
        
        // Notify all users in the session
        io.to(sessionId).emit('song_selected', { 
          songId,
          title: song.title,
          artist: song.artist,
          language: song.language
        });
        
        console.log(`Admin selected song ${songId} in session ${sessionId}`);
      } catch (error) {
        console.error('Error selecting song:', error);
        socket.emit('error', { message: 'Failed to select song' });
      }
    });
    
    // Admin quits song
    socket.on('quit_song', async (sessionId) => {
      try {
        // Verify user is admin
        if (!socket.user.isAdmin) {
          socket.emit('error', { message: 'Admin privileges required' });
          return;
        }
        
        // Validate session
        const session = await Session.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        // Clear active song
        await session.setActiveSong(null);
        
        // Notify all users in the session
        io.to(sessionId).emit('song_quit');
        
        console.log(`Admin ended song in session ${sessionId}`);
      } catch (error) {
        console.error('Error quitting song:', error);
        socket.emit('error', { message: 'Failed to quit song' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      // Remove user from any active session
      if (socket.sessionId) {
        try {
          const session = await Session.findById(socket.sessionId);
          
          if (session) {
            await session.removeUserBySocketId(socket.id);
            
            // Notify others
            io.to(socket.sessionId).emit('user_left', {
              username: socket.user.username
            });
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });
  });

  return io;
};

module.exports = setupSocket;