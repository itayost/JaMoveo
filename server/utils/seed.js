// server/utils/seed.js 
require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/song.model'); 
const User = require('../models/user.model'); 


const sampleSongs = [
  {
    "title": "Imagine",
    "artist": "John Lennon",
    "language": "English",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/en/9/9e/Imagine_John_Lennon.jpg",
    "lyrics": "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us only sky\nImagine all the people\nLiving for today...\n\nImagine there's no countries\nIt isn't hard to do\nNothing to kill or die for\nAnd no religion too\nImagine all the people\nLiving life in peace...\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will be as one\n\nImagine no possessions\nI wonder if you can\nNo need for greed or hunger\nA brotherhood of man\nImagine all the people\nSharing all the world...\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will live as one",
    "chords": "C       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F\n\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F\n\nF        Am    Dm    F\nG        C    E7  F\nF        Am    Dm    F\nG        C    E7  F\n\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nC       Cmaj7  F\nF        Am    Dm    F\nG        C    E7  F\n\nF        Am    Dm    F\nG        C    E7  F\nF        Am    Dm    F\nG        C    E7  F",
    "year": 1971,
    "genre": "Rock",
    "key": "C"
  },
  {
    "title": "הלב שלי",
    "artist": "עברי לידר",
    "language": "Hebrew",
    "imageUrl": "https://i.ytimg.com/vi/qSA6v5jrDqU/maxresdefault.jpg",
    "lyrics": "הלב שלי בוכה בשקט\nהוא לא רוצה שאשמע\nגם כשאני רוקד\nהוא רוקד אחר\n\nאז היום אני לא אשקר\nולא אתן לו להתפזר\nהוא בעצמו יבין\nמה הייתי צריך להרגיש\n\nאז איך אני לא אפחד\nאיך אני לא אשמר\nלאן אפול כשעכשיו\nהלב שלי נשבר\nלאן אפול כשעכשיו\nהלב שלי נשבר\n\nהלב שלי בוכה בשקט\nהוא לא רוצה שאשמע\nאולי הוא רק עייף\nואולי הוא נזכר\n\nמגלה לאט לאט עוד שקר\nכמה רחוק אפשר להתפזר\nלפני שנשארים נקיים\nמהכל",
    "chords": "Em      C        G\nEm      C        G\nAm      C        D\nEm      C        G\n\nEm      C        G\nEm      C        G\nAm      C        D\nEm      C        G\n\nC                G\nD                Em\nC        G\nEm\nC        G\nEm\n\nEm      C        G\nEm      C        G\nAm      C        D\nEm      C        G\n\nEm      C        G\nEm      C        G\nAm      C        D\nEm",
    "year": 2017,
    "genre": "Pop",
    "key": "Em"
  }
];

const seedDB = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Connect to database (only if not already connected)
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('Already connected to MongoDB');
    }

    // Clear existing songs
    const deletedSongs = await Song.deleteMany({});
    console.log(`Cleared ${deletedSongs.deletedCount} existing songs`);

    // Insert sample songs
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
      console.log('Created admin user (username: , password: )');
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
    
    // Only exit if this is run as a standalone script
    if (require.main === module) {
      process.exit(0);
    }
    
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    
    if (require.main === module) {
      process.exit(1);
    }
    
    throw error;
  }
};

// Export the function for use in other files
module.exports = seedDB;

// Run the seed function only if this file is executed directly
if (require.main === module) {
  seedDB();
}