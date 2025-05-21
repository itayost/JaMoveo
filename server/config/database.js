// server/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Add more robust connection options for production
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options ensure robust connection handling
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
      // Auto-index creation is set to true for development but should be false in production
      autoIndex: process.env.NODE_ENV !== 'production'
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Ensure all models are loaded so indexes can be created
    require('../models/user.model');
    require('../models/song.model');
    require('../models/session.model');
    
    // Event listeners for connection status
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });
    
    // Handle application termination - close mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed due to application termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;