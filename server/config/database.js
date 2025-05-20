// server/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Ensure all models are loaded so indexes can be created
    require('../models/user.model');
    require('../models/song.model');
    require('../models/session.model');
    
    // On successful connection, create indexes (in background)
    mongoose.connection.on('connected', () => {
      console.log('Creating indexes in the background...');
      mongoose.models.User?.createIndexes();
      mongoose.models.Song?.createIndexes();
      mongoose.models.Session?.createIndexes();
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;