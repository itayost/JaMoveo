// server/utils/createIndexes.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/user.model');
const Song = require('../models/song.model');
const Session = require('../models/session.model');

// Connect to the database
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const createIndexes = async () => {
  try {
    console.log('Creating indexes...');
    
    // Explicitly create indexes for User model
    console.log('Creating User indexes...');
    await User.createIndexes();
    
    // Explicitly create indexes for Song model
    console.log('Creating Song indexes...');
    await Song.createIndexes();
    
    // Explicitly create indexes for Session model
    console.log('Creating Session indexes...');
    await Session.createIndexes();
    
    console.log('All indexes created successfully!');
    
    // List all indexes
    console.log('\nCurrent indexes in the database:');
    
    console.log('\nUser Collection Indexes:');
    const userIndexes = await User.collection.indexes();
    console.log(userIndexes);
    
    console.log('\nSong Collection Indexes:');
    const songIndexes = await Song.collection.indexes();
    console.log(songIndexes);
    
    console.log('\nSession Collection Indexes:');
    const sessionIndexes = await Session.collection.indexes();
    console.log(sessionIndexes);
    
    console.log('\nIndex creation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();