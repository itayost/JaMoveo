// server/controllers/session.controller.js
const Session = require('../models/session.model');
const Song = require('../models/song.model');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get active session
 * @route   GET /api/sessions/active
 * @access  Private
 */
const getActiveSession = asyncHandler(async (req, res) => {
  // Get most recent active session
  const session = await Session.findOne({ isActive: true })
    .sort({ createdAt: -1 })
    .populate('admin', 'username')
    .populate('activeSong', 'title artist language');
  
  res.json({
    success: true,
    session
  });
});

/**
 * @desc    Create a new session
 * @route   POST /api/sessions
 * @access  Private/Admin
 */
const createSession = asyncHandler(async (req, res) => {
  // Verify user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Only admin users can create sessions'
    });
  }
  
  // Create session
  const session = await Session.create({
    name: `Rehearsal ${new Date().toLocaleString()}`,
    admin: req.user._id,
    isActive: true
  });
  
  // Populate admin details
  await session.populate('admin', 'username');
  
  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    session: {
      _id: session._id,
      name: session.name,
      admin: session.admin,
      isActive: session.isActive,
      createdAt: session.createdAt
    }
  });
});

/**
 * @desc    Join a session
 * @route   POST /api/sessions/:id/join
 * @access  Private
 */
const joinSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('activeSong', 'title artist language');
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  if (!session.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Session is not active'
    });
  }
  
  res.json({
    success: true,
    message: 'Joined session successfully',
    session: {
      id: session._id,
      name: session.name,
      activeSong: session.activeSong,
      isActive: session.isActive
    }
  });
});

/**
 * @desc    Set active song for a session
 * @route   POST /api/sessions/:id/set-song/:songId
 * @access  Private/Admin
 */
const setActiveSong = asyncHandler(async (req, res) => {
  // Verify user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Only admin users can set active songs'
    });
  }
  
  // Check if session exists
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  // Check if song exists
  const song = await Song.findById(req.params.songId);
  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }
  
  // Set active song
  session.activeSong = song._id;
  await session.save();
  
  // Get Socket.io instance to emit events
  const io = req.app.get('io');
  if (io) {
    // Emit to all users in the session
    io.to(session._id.toString()).emit('song_selected', { 
      songId: song._id.toString(),
      title: song.title,
      artist: song.artist,
      language: song.language
    });
  }
  
  res.json({
    success: true,
    message: 'Active song set successfully',
    session: {
      id: session._id,
      name: session.name,
      activeSong: {
        id: song._id,
        title: song.title,
        artist: song.artist
      }
    }
  });
});

/**
 * @desc    Clear active song for a session (quit song)
 * @route   POST /api/sessions/:id/clear-song
 * @access  Private/Admin
 */
const clearActiveSong = asyncHandler(async (req, res) => {
  // Verify user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Only admin users can clear active songs'
    });
  }
  
  // Check if session exists
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  // Clear active song
  session.activeSong = null;
  await session.save();
  
  // Get Socket.io instance to emit events
  const io = req.app.get('io');
  if (io) {
    // Emit to all users in the session
    io.to(session._id.toString()).emit('song_quit');
  }
  
  res.json({
    success: true,
    message: 'Active song cleared successfully'
  });
});

module.exports = {
  getActiveSession,
  createSession,
  joinSession,
  setActiveSong,
  clearActiveSong
};