// server/controllers/song.controller.js
const Song = require('../models/song.model');

// @desc    Get all songs with filtering
// @route   GET /api/songs
// @access  Private
const getSongs = async (req, res) => {
  try {
    const { query, language, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    let filter = {};
    let sort = { createdAt: -1 }; // Default sort
    
    // Add text search if query provided
    if (query && query.trim() !== '') {
      filter.$text = { $search: query };
      // When using text search, sort by text score
      sort = { score: { $meta: 'textScore' } };
    }
    
    // Filter by language if provided
    if (language && ['English', 'Hebrew'].includes(language)) {
      filter.language = language;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with projection and sorting
    const songs = await Song.find(
      filter,
      // Include text score in projection when using text search
      query ? { score: { $meta: 'textScore' } } : {}
    )
      .select('title artist language imageUrl year')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalSongs = await Song.countDocuments(filter);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalSongs / parseInt(limit));
    
    res.json({
      success: true,
      songs,
      pagination: {
        totalSongs,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};


// @desc    Get a single song by ID
// @route   GET /api/songs/:id
// @access  Private
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (song) {
      res.json({
        success: true,
        song
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Create a new song
// @route   POST /api/songs
// @access  Private/Admin
const createSong = async (req, res) => {
  try {
    const { title, artist, language, lyrics, chords, imageUrl, year, genre, key } = req.body;
    
    const song = await Song.create({
      title,
      artist,
      language,
      lyrics,
      chords,
      imageUrl,
      year,
      genre,
      key
    });
    
    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      song
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
// @access  Private/Admin
const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (song) {
      // Update fields if provided
      song.title = req.body.title || song.title;
      song.artist = req.body.artist || song.artist;
      song.language = req.body.language || song.language;
      song.lyrics = req.body.lyrics || song.lyrics;
      song.chords = req.body.chords || song.chords;
      song.imageUrl = req.body.imageUrl || song.imageUrl;
      song.year = req.body.year || song.year;
      song.genre = req.body.genre || song.genre;
      song.key = req.body.key || song.key;
      
      const updatedSong = await song.save();
      
      res.json({
        success: true,
        message: 'Song updated successfully',
        song: updatedSong
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private/Admin
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (song) {
      await song.remove();
      
      res.json({
        success: true,
        message: 'Song deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  getSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong
};