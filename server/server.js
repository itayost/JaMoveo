// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const connectDB = require('./config/database');
const setupSocket = require('./socket');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const songRoutes = require('./routes/song.routes');
const sessionRoutes = require('./routes/session.routes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Configure CORS with more robust options
const corsOptions = {
  origin: function (origin, callback) {
    // In production, restrict to specific origins
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [process.env.CLIENT_URL].filter(Boolean) // Filter out undefined/empty
      : [
          'http://localhost:3000',         // Standard React dev server
          'http://127.0.0.1:3000',         // Alternative local address
          'http://localhost:5173',         // Vite dev server
          'http://localhost:8080'          // Another common dev port
        ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,           // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400                // Cache preflight requests for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Request parsing middleware
app.use(express.json({ limit: '1mb' }));  // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Any route that doesn't match the API routes will be handled by the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Not Found middleware
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Set up Socket.io
const io = setupSocket(server);

// Store io instance to app for potential use in routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash in production, but log the error
  if (process.env.NODE_ENV !== 'production') {
    server.close(() => process.exit(1));
  }
});

module.exports = { app, server };  // Export for testing