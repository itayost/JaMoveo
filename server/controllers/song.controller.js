// server/controllers/song.controller.js
const Song = require('../models/song.model');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get all songs with filtering
 * @route   GET /api/songs
 * @access  Private
 */
const getSongs = asyncHandler(async (req, res) => {
  // Extract query parameters with defaults
  const {
    query = '',
    language,
    page = 1,
    limit = 10,
    sortBy = 'relevance'
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  // Text search if query provided (title, artist, or lyrics)
  if (query.trim() !== '') {
    filter.$text = { $search: query };
  }
  
  // Filter by language if provided
  if (language && ['English', 'Hebrew'].includes(language)) {
    filter.language = language;
  }
  
  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Sorting options
  let sort = {};
  if (query.trim() !== '' && sortBy === 'relevance') {
    // When using text search and sorting by relevance, use text score
    sort = { score: { $meta: 'textScore' } };
  } else if (sortBy === 'title') {
    sort = { title: 1 }; // Ascending by title
  } else if (sortBy === 'artist') {
    sort = { artist: 1 }; // Ascending by artist
  } else if (sortBy === 'newest') {
    sort = { createdAt: -1 }; // Descending by creation date
  } else {
    // Default sort by creation date
    sort = { createdAt: -1 };
  }
  
  // Create projection for text search
  const projection = query.trim() !== '' ? 
    { score: { $meta: 'textScore' } } : 
    {};
  
  // Execute query with projection and sorting
  const songs = await Song.find(
    filter,
    projection
  )
    .select('title artist language imageUrl year genre key')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
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
});

/**
 * @desc    Get a single song by ID
 * @route   GET /api/songs/:id
 * @access  Private
 */
const getSongById = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid song ID format'
    });
  }
  
  const song = await Song.findById(req.params.id);
  
  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }
  
  res.json({
    success: true,
    song
  });
});

module.exports = {
  getSongs,
  getSongById
};