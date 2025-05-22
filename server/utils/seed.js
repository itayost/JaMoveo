// server/utils/seed.js 
require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('./models/song.model');
const User = require('./models/user.model');
const sampleSongs = require('./data/sampleSongs.json');

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing songs
    await Song.deleteMany({});
    console.log('Cleared existing songs');

    // Insert sample songs from your data folder
    await Song.insertMany(sampleSongs);
    console.log(`Inserted ${sampleSongs.length} songs`);

    // Create default admin user if doesn't exist
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        instrument: 'other',
        otherInstrument: 'Admin',
        isAdmin: true
      });
      console.log('Created admin user (username: admin, password: admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // Create default regular user if doesn't exist
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      await User.create({
        username: 'user',
        password: 'password',
        instrument: 'guitar',
        isAdmin: false
      });
      console.log('Created test user (username: user, password: password)');
    } else {
      console.log('Test user already exists');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDB();