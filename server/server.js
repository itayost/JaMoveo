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
// Replace your seed endpoint with this more detailed version
app.post('/api/seed', async (req, res) => {
  try {
    console.log('🌱 Seed endpoint called');
    
    // Check if models are accessible
    const Song = require('./models/song.model');
    const User = require('./models/user.model');
    console.log('✅ Models loaded successfully');
    
    // Check database connection
    console.log('📊 Database connection state:', require('mongoose').connection.readyState);
    
    // Sample songs data directly in endpoint for testing
    const sampleSongs = [
      {
        title: "Imagine",
        artist: "John Lennon",
        language: "English",
        lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us only sky\nImagine all the people\nLiving for today...",
        chords: "C Cmaj7 F\nC Cmaj7 F\nF Am Dm F\nG C E7 F",
        year: 1971,
        genre: "Rock",
        key: "C"
      },
      {
        title: "Hotel California",
        artist: "Eagles",
        language: "English",
        lyrics: "On a dark desert highway, cool wind in my hair\nWarm smell of colitas, rising up through the air\nUp ahead in the distance, I saw a shimmering light...",
        chords: "Bm F# A E G D Em F#\nBm F# A E G D Em F#",
        year: 1976,
        genre: "Rock",
        key: "Bm"
      }
    ];
    
    // Clear existing songs
    console.log('🗑️ Clearing existing songs...');
    const deletedResult = await Song.deleteMany({});
    console.log(`🗑️ Deleted ${deletedResult.deletedCount} songs`);
    
    // Insert new songs
    console.log('🎵 Inserting new songs...');
    const insertedSongs = await Song.insertMany(sampleSongs);
    console.log(`🎵 Inserted ${insertedSongs.length} songs`);
    
    // Verify songs were inserted
    const songCount = await Song.countDocuments();
    console.log(`📊 Total songs in database: ${songCount}`);
    
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'adminpassword',
        instrument: 'other',
        otherInstrument: 'Admin',
        isAdmin: true
      });
      console.log('👑 Created admin user');
    } else {
      console.log('👑 Admin user already exists');
    }
    
    // Create regular user if doesn't exist
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      await User.create({
        username: 'user',
        password: 'password',
        instrument: 'guitar',
        isAdmin: false
      });
      console.log('🎸 Created regular user');
    } else {
      console.log('🎸 Regular user already exists');
    }
    
    const finalSongCount = await Song.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      songsCreated: insertedSongs.length,
      totalSongs: finalSongCount,
      totalUsers: userCount,
      songs: insertedSongs.map(song => ({ title: song.title, artist: song.artist }))
    });
    
  } catch (error) {
    console.error('💥 Seed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Also add a simple songs check endpoint
app.get('/api/songs-check', async (req, res) => {
  try {
    const Song = require('./models/song.model');
    const songs = await Song.find({}).select('title artist language');
    const count = await Song.countDocuments();
    
    res.json({
      success: true,
      totalSongs: count,
      songs: songs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
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