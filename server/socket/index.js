// server/socket/index.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const Song = require('../models/song.model');

/**
 * Check if user is an admin
 * @param {Object} socket - Socket object with attached user
 * @returns {Boolean} True if user is admin
 */
const isUserAdmin = (socket) => {
  return socket.user && socket.user.isAdmin === true;
};

/**
 * Setup Socket.io server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Configured Socket.io instance
 */
const setupSocket = (server) => {
  // Initialize Socket.io with CORS configuration
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Connection options
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Get token from auth object in handshake
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
      
      // Attach user to socket for use in event handlers
      socket.user = {
        id: user._id,
        username: user.username,
        instrument: user.instrument,
        otherInstrument: user.otherInstrument,
        isAdmin: user.isAdmin
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (ID: ${socket.id})`);
    
    // Join session
    socket.on('join_session', async (sessionId) => {
      try {
        console.log(`${socket.user.username} attempting to join session: ${sessionId}`);
        
        // Validate session exists and is active
        const session = await Session.findById(sessionId)
          .populate('admin', 'username')
          .populate('activeSong', 'title artist language');
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        if (!session.isActive) {
          socket.emit('error', { message: 'Session is not active' });
          return;
        }
        
        // Join socket room
        socket.join(sessionId);
        
        // Add user to session in database
        await session.addUser(socket.user.id, socket.id);
        
        // Notify others that user has joined
        socket.to(sessionId).emit('user_joined', {
          username: socket.user.username,
          instrument: socket.user.instrument,
          otherInstrument: socket.user.otherInstrument
        });
        
        // Send session state to newly joined user
        socket.emit('session_state', {
          id: session._id,
          name: session.name,
          admin: session.admin,
          activeSong: session.activeSong,
          connectedUsers: session.connectedUsers.length
        });
        
        // Store session ID in socket for later use
        socket.sessionId = sessionId;
        
        console.log(`${socket.user.username} joined session ${sessionId}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });
    
    // Leave session
    socket.on('leave_session', async () => {
      try {
        if (!socket.sessionId) {
          return; // Not in a session
        }
        
        const session = await Session.findById(socket.sessionId);
        
        if (session) {
          // Remove user from session
          await session.removeUser(socket.user.id);
          
          // Notify others that user has left
          socket.to(socket.sessionId).emit('user_left', {
            username: socket.user.username
          });
          
          // Leave socket room
          socket.leave(socket.sessionId);
          
          console.log(`${socket.user.username} left session ${socket.sessionId}`);
          
          // Clear session ID from socket
          socket.sessionId = null;
        }
      } catch (error) {
        console.error('Error leaving session:', error);
        socket.emit('error', { message: 'Failed to leave session' });
      }
    });
    
    // Admin selects a song
    socket.on('select_song', async (data) => {
      try {
        const { sessionId, songId } = data;
        
        // Verify user is admin
        if (!isUserAdmin(socket)) {
          socket.emit('error', { message: 'Unauthorized: Admin privileges required' });
          return;
        }
        
        // Validate session exists
        const session = await Session.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        // Extra security: Verify the admin is the session owner
        if (session.admin.toString() !== socket.user.id.toString()) {
          socket.emit('error', { message: 'Unauthorized: Only session admin can select songs' });
          return;
        }
        
        // Validate song exists
        const song = await Song.findById(songId);
        
        if (!song) {
          socket.emit('error', { message: 'Song not found' });
          return;
        }
        
        // Set active song in the session
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
        if (!isUserAdmin(socket)) {
          socket.emit('error', { message: 'Unauthorized: Admin privileges required' });
          return;
        }
        
        // Validate session
        const session = await Session.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        // Extra security: Verify the admin is the session owner
        if (session.admin.toString() !== socket.user.id.toString()) {
          socket.emit('error', { message: 'Unauthorized: Only session admin can control this session' });
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
    
    // Auto-scroll toggle
    socket.on('toggle_autoscroll', (data) => {
      const { sessionId, enabled, speed } = data;
      
      // Validate session exists
      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }
      
      // Broadcast to all users in the session except sender
      socket.to(sessionId).emit('autoscroll_state', { 
        enabled, 
        speed,
        triggeredBy: socket.user.username
      });
      
      console.log(`${socket.user.username} toggled auto-scroll (${enabled ? 'on' : 'off'}, speed: ${speed}) in session ${sessionId}`);
    });
    
    // Scroll position update
    socket.on('scroll_position', (data) => {
      const { sessionId, position } = data;
      
      // Only admin can broadcast scroll position
      if (!isUserAdmin(socket)) return;
      
      // Broadcast to all users in the session except sender
      socket.to(sessionId).emit('scroll_position_update', { 
        position,
        triggeredBy: socket.user.username
      });
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
            
            console.log(`${socket.user.username} removed from session ${socket.sessionId} due to disconnect`);
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