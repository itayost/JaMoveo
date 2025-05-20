// server/models/song.model.js
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['English', 'Hebrew']
  },
  lyrics: {
    type: String,
    required: [true, 'Lyrics are required']
  },
  chords: {
    type: String,
    required: [true, 'Chords are required']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/150?text=No+Image'
  },
  year: {
    type: Number
  },
  genre: {
    type: String,
    trim: true
  },
  key: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create text index for searching
songSchema.index({ 
  title: 'text', 
  artist: 'text', 
  lyrics: 'text' 
}, {
  weights: {
    title: 10,
    artist: 5,
    lyrics: 1
  },
  name: 'song_text_index'
});

// Language index for filtering songs by language
songSchema.index({ language: 1 });

// Combined index for language and artist queries
songSchema.index({ language: 1, artist: 1 });

// Year index for filtering by year
songSchema.index({ year: 1 });

const Song = mongoose.model('Song', songSchema);

module.exports = Song;