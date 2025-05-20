// server/utils/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database');
const User = require('../models/user.model');
const Song = require('../models/song.model');

// Connect to database
connectDB();

// Sample song data
const songs = [
  {
    title: "Imagine",
    artist: "John Lennon",
    language: "English",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9e/Imagine_John_Lennon.jpg",
    lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us only sky\nImagine all the people\nLiving for today...\n\nImagine there's no countries\nIt isn't hard to do\nNothing to kill or die for\nAnd no religion too\nImagine all the people\nLiving life in peace...\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will be as one\n\nImagine no possessions\nI wonder if you can\nNo need for greed or hunger\nA brotherhood of man\nImagine all the people\nSharing all the world...\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will live as one",
    chords: "C       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F\n\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F\n\nF        Am    Dm    F\nG        C    E7  F\nF        Am    Dm    F\nG        C    E7  F\n\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F\n\nF        Am    Dm    F\nG        C    E7  F\nF        Am    Dm    F\nG        C    E7  F",
    year: 1971,
    genre: "Rock",
    key: "C"
  },
  {
    title: "הלב שלי",
    artist: "עברי לידר",
    language: "Hebrew",
    imageUrl: "https://i.ytimg.com/vi/qSA6v5jrDqU/maxresdefault.jpg",
    lyrics: "הלב שלי בוכה בשקט\nהוא לא רוצה שאשמע\nגם כשאני רוקד\nהוא רוקד אחר\n\nאז היום אני לא אשקר\nולא אתן לו להתפזר\nהוא בעצמו יבין\nמה הייתי צריך להרגיש\n\nאז איך אני לא אפחד\nאיך אני לא אשמר\nלאן אפול כשעכשיו\nהלב שלי נשבר\nלאן אפול כשעכשיו\nהלב שלי נשבר\n\nהלב שלי בוכה בשקט\nהוא לא רוצה שאשמע\nאולי הוא רק עייף\nואולי הוא נזכר\n\nמגלה לאט לאט עוד שקר\nכמה רחוק אפשר להתפזר\nלפני שנשארים נקיים\nמהכל",
    chords: "Em      C        G\nEm      C        G\nAm      C        D\nEm      C        G\n\nEm      C        G\nEm      C        G\nAm      C        D\nEm      C        G\n\nC                G\nD                Em\nC        G\nEm\nC        G\nEm\n\nEm      C        G\nEm      C        G\nAm      C        D\nEm      C        G\n\nEm      C        G\nEm      C        G\nAm      C        D\nEm",
    year: 2017,
    genre: "Pop",
    key: "Em"
  }
];

// Create default admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ isAdmin: true });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      password: 'adminpassword',
      instrument: 'other',
      otherInstrument: 'Admin',
      isAdmin: true
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Create default regular user
const createRegularUser = async () => {
  try {
    // Check if user already exists
    const userExists = await User.findOne({ username: 'user' });
    
    if (userExists) {
      console.log('Regular user already exists');
      return;
    }
    
    // Create regular user
    const regularUser = await User.create({
      username: 'user',
      password: 'password',
      instrument: 'guitar',
      isAdmin: false
    });
    
    console.log('Regular user created successfully');
  } catch (error) {
    console.error('Error creating regular user:', error);
  }
};

// Seed song data
const seedSongs = async () => {
  try {
    // Delete existing songs
    await Song.deleteMany({});
    console.log('Deleted existing songs');
    
    // Insert sample songs
    const createdSongs = await Song.insertMany(songs);
    console.log(`${createdSongs.length} songs inserted`);
  } catch (error) {
    console.error('Error seeding songs:', error);
  }
};

// Run seed functions
const seedAll = async () => {
  try {
    await createAdminUser();
    await createRegularUser();
    await seedSongs();
    
    console.log('Data seeding completed successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();