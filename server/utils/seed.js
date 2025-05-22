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