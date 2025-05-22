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

// Seeding songs and users with inline chord format
app.post('/api/seed', async (req, res) => {
  try {
    console.log('🌱 Seed endpoint called');
    
    // Check if models are accessible
    const Song = require('./models/song.model');
    const User = require('./models/user.model');
    console.log('✅ Models loaded successfully');
    
    // Check database connection
    console.log('📊 Database connection state:', require('mongoose').connection.readyState);
    
    // Sample songs with inline chord format - only the two requested songs
    const sampleSongs = [
      {
        title: "Hey Jude",
        artist: "The Beatles",
        language: "English",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/80/Hey_Jude_Single.jpg",
        lyricsWithChords: [
          [
            {"lyrics": "Hey"},
            {"lyrics": "Jude", "chords": "F"},
            {"lyrics": "don't"},
            {"lyrics": "make"},
            {"lyrics": "it"},
            {"lyrics": "bad", "chords": "C"}
          ],
          [
            {"lyrics": "Take"},
            {"lyrics": "a"},
            {"lyrics": "sad", "chords": "C7"},
            {"lyrics": "song", "chords": "C4/7"},
            {"lyrics": "and"},
            {"lyrics": "make"},
            {"lyrics": "it"},
            {"lyrics": "better", "chords": "F"}
          ],
          [
            {"lyrics": "Remember", "chords": "Bb"},
            {"lyrics": "to"},
            {"lyrics": "let"},
            {"lyrics": "her"},
            {"lyrics": "into"},
            {"lyrics": "your"},
            {"lyrics": "heart", "chords": "F"}
          ],
          [
            {"lyrics": "Then"},
            {"lyrics": "you"},
            {"lyrics": "can"},
            {"lyrics": "start", "chords": "C"},
            {"lyrics": "to"},
            {"lyrics": "make", "chords": "C7"},
            {"lyrics": "it"},
            {"lyrics": "better", "chords": "F"}
          ]
        ],
        year: 1968,
        genre: "Rock",
        key: "F"
      },
      {
        title: "ובלילות",
        artist: "זמר עברי",
        language: "Hebrew",
        imageUrl: "https://via.placeholder.com/300x300?text=Hebrew+Song",
        lyricsWithChords: [
          [
            {"lyrics": "ואיך"},
            {"lyrics": "שלא", "chords": "Em"},
            {"lyrics": "אפנה"},
            {"lyrics": "לראות", "chords": "Em/D"}
          ],
          [
            {"lyrics": "תמיד"},
            {"lyrics": "איתה", "chords": "Cmaj7"},
            {"lyrics": "ארצה"},
            {"lyrics": "להיות", "chords": "G"}
          ],
          [
            {"lyrics": "שומרת"},
            {"lyrics": "לי", "chords": "Em"},
            {"lyrics": "היא"},
            {"lyrics": "אמונים", "chords": "Em/D"}
          ],
          [
            {"lyrics": "לא"},
            {"lyrics": "מתרוצצת", "chords": "Cmaj7"},
            {"lyrics": "בגנים", "chords": "G"}
          ],
          [
            {"lyrics": "ובלילות", "chords": "E"},
            {"lyrics": "ובלילות", "chords": "Em/D"}
          ],
          [
            {"lyrics": "עולות"},
            {"lyrics": "עולות", "chords": "Cmaj7"},
            {"lyrics": "בי"},
            {"lyrics": "מנגינות", "chords": "G"}
          ],
          [
            {"lyrics": "וזרם"},
            {"lyrics": "דק", "chords": "E"},
            {"lyrics": "קולח", "chords": "Em/D"}
          ],
          [
            {"lyrics": "ותפילותי", "chords": "Cmaj7"},
            {"lyrics": "לרוח"},
            {"lyrics": "נענות", "chords": "G"}
          ]
        ],
        year: 2020,
        genre: "Hebrew Folk",
        key: "Em"
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
      console.log('👑 Created admin user (username: admin, password: adminpassword)');
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
      console.log('🎸 Created regular user (username: user, password: password)');
    } else {
      console.log('🎸 Regular user already exists');
    }
    
    // Create a vocalist user for testing
    const vocalistExists = await User.findOne({ username: 'vocalist' });
    if (!vocalistExists) {
      await User.create({
        username: 'vocalist',
        password: 'password',
        instrument: 'vocals',
        isAdmin: false
      });
      console.log('🎤 Created vocalist user (username: vocalist, password: password)');
    } else {
      console.log('🎤 Vocalist user already exists');
    }
    
    const finalSongCount = await Song.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({ 
      success: true, 
      message: 'Database seeded successfully with inline chord format!',
      songsCreated: insertedSongs.length,
      totalSongs: finalSongCount,
      totalUsers: userCount,
      songs: insertedSongs.map(song => ({ 
        title: song.title, 
        artist: song.artist, 
        language: song.language,
        key: song.key
      })),
      users: [
        { username: 'admin', password: 'adminpassword', role: 'admin' },
        { username: 'user', password: 'password', role: 'guitarist' },
        { username: 'vocalist', password: 'password', role: 'vocalist' }
      ]
    });
    
  } catch (error) {
    console.error('💥 Seed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing - return all requests to React app
  app.get('*', (req, res) => {
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Seed endpoint: POST http://localhost:${PORT}/api/seed`);
  console.log(`🔍 Songs check: GET http://localhost:${PORT}/api/songs-check`);
});