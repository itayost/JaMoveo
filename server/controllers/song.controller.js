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

/**
 * @desc    Create a new song
 * @route   POST /api/songs
 * @access  Private/Admin
 */
const createSong = asyncHandler(async (req, res) => {
  const {
    title,
    artist,
    language,
    lyrics,
    chords,
    imageUrl,
    year,
    genre,
    key
  } = req.body;
  
  // Validate required fields
  if (!title || !artist || !language || !lyrics || !chords) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
      requiredFields: ['title', 'artist', 'language', 'lyrics', 'chords']
    });
  }
  
  // Validate language
  if (!['English', 'Hebrew'].includes(language)) {
    return res.status(400).json({
      success: false,
      message: 'Language must be either "English" or "Hebrew"'
    });
  }
  
  // Create song
  const song = await Song.create({
    title,
    artist,
    language,
    lyrics,
    chords,
    imageUrl: imageUrl || undefined,
    year: year || undefined,
    genre: genre || undefined,
    key: key || undefined
  });
  
  res.status(201).json({
    success: true,
    message: 'Song created successfully',
    song: {
      id: song._id,
      title: song.title,
      artist: song.artist,
      language: song.language
    }
  });
});

/**
 * @desc    Update a song
 * @route   PUT /api/songs/:id
 * @access  Private/Admin
 */
const updateSong = asyncHandler(async (req, res) => {
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
  
  // Validate language if provided
  if (req.body.language && !['English', 'Hebrew'].includes(req.body.language)) {
    return res.status(400).json({
      success: false,
      message: 'Language must be either "English" or "Hebrew"'
    });
  }
  
  // Update fields if provided
  song.title = req.body.title || song.title;
  song.artist = req.body.artist || song.artist;
  song.language = req.body.language || song.language;
  song.lyrics = req.body.lyrics || song.lyrics;
  song.chords = req.body.chords || song.chords;
  
  // Optional fields
  if (req.body.imageUrl !== undefined) song.imageUrl = req.body.imageUrl;
  if (req.body.year !== undefined) song.year = req.body.year;
  if (req.body.genre !== undefined) song.genre = req.body.genre;
  if (req.body.key !== undefined) song.key = req.body.key;
  
  const updatedSong = await song.save();
  
  res.json({
    success: true,
    message: 'Song updated successfully',
    song: {
      id: updatedSong._id,
      title: updatedSong.title,
      artist: updatedSong.artist,
      language: updatedSong.language,
      updatedAt: updatedSong.updatedAt
    }
  });
});

/**
 * @desc    Delete a song
 * @route   DELETE /api/songs/:id
 * @access  Private/Admin
 */
const deleteSong = asyncHandler(async (req, res) => {
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
  
  await Song.deleteOne({ _id: song._id });
  
  res.json({
    success: true,
    message: 'Song deleted successfully'
  });
});

module.exports = {
  getSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong
};