// server/socket/index.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Session = require('../models/session.model');

const isUserAdmin = (socket) => {
  return socket.user && socket.user.isAdmin === true;
};

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket middleware for authentication
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
        otherInstrument: user.otherInstrument,
        isAdmin: user.isAdmin
      };
      
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Join session
    socket.on('join_session', async (sessionId) => {
      try {
        const session = await Session.findById(sessionId)
          .populate('admin', 'username')
          .populate('activeSong', 'title artist');
        
        if (!session || !session.isActive) {
          socket.emit('error', { message: 'Session not found or inactive' });
          return;
        }
        
        // Join socket room
        socket.join(sessionId);
        
        // Add user to session
        await session.addUser(socket.user.id, socket.id);
        
        // Notify others
        socket.to(sessionId).emit('user_joined', {
          username: socket.user.username,
          instrument: socket.user.instrument,
          otherInstrument: socket.user.otherInstrument
        });
        
        // Send session state
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
        if (socket.sessionId) {
          const session = await Session.findById(socket.sessionId);
          
          if (session) {
            // Remove user from session
            await session.removeUser(socket.user.id);
            
            // Notify others
            socket.to(socket.sessionId).emit('user_left', {
              username: socket.user.username
            });
            
            // Leave socket room
            socket.leave(socket.sessionId);
            
            // Clear session ID
            socket.sessionId = null;
            
            console.log(`${socket.user.username} left session`);
          }
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
    
    //Admin verification
    if (!isUserAdmin(socket)) {
      socket.emit('error', { message: 'Unauthorized: Admin privileges required' });
      return;
    }
    
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
    
    // Set active song
    await session.setActiveSong(songId);
    
    // Notify all users in the session
    io.to(sessionId).emit('song_selected', { songId });
    
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
          socket.emit('error', { message: 'Unauthorized: Admin only' });
          return;
        }
        
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
    
    // Auto-scroll toggle
    socket.on('toggle_autoscroll', (data) => {
      const { sessionId, enabled, speed } = data;
      
      // Broadcast to all users in the session
      socket.to(sessionId).emit('autoscroll_state', { enabled, speed });
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      // Remove user from any active session
      if (socket.sessionId) {
        try {
          const session = await Session.findById(socket.sessionId);
          
          if (session) {
            await session.removeUser(socket.user.id);
            
            // Notify others
            socket.to(socket.sessionId).emit('user_left', {
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