// server/server.js - Add Socket.IO setup
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http'); // Add this for Socket.IO

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const songRoutes = require('./routes/song.routes');
const sessionRoutes = require('./routes/session.routes');

// Create Express app
const app = express();

// Create HTTP server using Express app
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Setup Socket.IO with CORS options
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  
  // Add your socket event handlers here
  socket.on('join_session', (sessionId) => {
    console.log(`User ${socket.id} joined session ${sessionId}`);
    socket.join(sessionId);
    socket.to(sessionId).emit('user_joined', { socketId: socket.id });
  });
  
  socket.on('leave_session', (sessionId) => {
    console.log(`User ${socket.id} left session ${sessionId}`);
    socket.leave(sessionId);
    socket.to(sessionId).emit('user_left', { socketId: socket.id });
  });
  
  socket.on('select_song', (data) => {
    console.log(`Admin selected song ${data.songId} in session ${data.sessionId}`);
    io.to(data.sessionId).emit('song_selected', { songId: data.songId });
  });
  
  socket.on('quit_song', (sessionId) => {
    console.log(`Admin ended song in session ${sessionId}`);
    io.to(sessionId).emit('song_quit');
  });
  
  socket.on('toggle_autoscroll', (data) => {
    console.log(`Auto-scroll toggled in session ${data.sessionId}`);
    socket.to(data.sessionId).emit('autoscroll_state', { 
      enabled: data.enabled, 
      speed: data.speed 
    });
  });
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jamoveo')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/sessions', sessionRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server using the HTTP server (not the Express app directly)
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;