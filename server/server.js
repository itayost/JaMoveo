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
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logging in development
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

//Seeding songs and users to initial DB
app.post('/api/seed', async (req, res) => {
  try {
    const seedDB = require('./utils/seed.js');
    const result = await seedDB();
    res.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing - return all requests to React app
  app.get('/*path', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Set up Socket.io
const io = setupSocket(server);

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});