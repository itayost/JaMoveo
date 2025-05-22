// server/models/song.model.js - Clean inline chord format only
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
  // Lyrics with inline chords format
  lyricsWithChords: {
    type: Array,
    required: [true, 'Lyrics with chords are required'],
    validate: {
      validator: function(v) {
        // Validate structure: array of lines, each line is array of word objects
        if (!Array.isArray(v)) return false;
        
        return v.every(line => 
          Array.isArray(line) && 
          line.every(word => 
            typeof word === 'object' && 
            word.lyrics && 
            typeof word.lyrics === 'string' &&
            (word.chords === undefined || typeof word.chords === 'string')
          )
        );
      },
      message: 'lyricsWithChords must be an array of lines, where each line is an array of word objects with lyrics property and optional chords property'
    }
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

// Create text index for searching - extract lyrics from inline format
songSchema.index({ 
  title: 'text', 
  artist: 'text', 
  'lyricsText': 'text' 
}, {
  weights: {
    title: 10,
    artist: 5,
    lyricsText: 1
  },
  name: 'song_text_index'
});

// Language index for filtering songs by language
songSchema.index({ language: 1 });

// Combined index for language and artist queries
songSchema.index({ language: 1, artist: 1 });

// Year index for filtering by year
songSchema.index({ year: 1 });

// Virtual field to get searchable lyrics text from inline format
songSchema.virtual('lyricsText').get(function() {
  if (this.lyricsWithChords && Array.isArray(this.lyricsWithChords)) {
    return this.lyricsWithChords
      .map(line => line.map(word => word.lyrics).join(' '))
      .join('\n');
  }
  return '';
});

// Method to get plain lyrics (for vocalists or search)
songSchema.methods.getPlainLyrics = function() {
  return this.lyricsWithChords
    .map(line => line.map(word => word.lyrics).join(' '))
    .join('\n');
};

// Method to get all unique chords used in the song
songSchema.methods.getChords = function() {
  const chords = new Set();
  this.lyricsWithChords.forEach(line => {
    line.forEach(word => {
      if (word.chords) {
        chords.add(word.chords);
      }
    });
  });
  return Array.from(chords).sort();
};

const Song = mongoose.model('Song', songSchema);

module.exports = Song;