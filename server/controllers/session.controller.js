// server/controllers/session.controller.js
const Session = require('../models/session.model');
const User = require('../models/user.model');
const Song = require('../models/song.model');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get active sessions
 * @route   GET /api/sessions/active
 * @access  Private
 */
const getActiveSessions = asyncHandler(async (req, res) => {
  const { latest = 'true' } = req.query;
  const isLatestOnly = latest === 'true';
  
  if (isLatestOnly) {
    // Get most recent active session using the isActive + createdAt index
    const session = await Session.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('admin', 'username')
      .populate('activeSong', 'title artist language')
      .populate('connectedUsers.user', 'username instrument otherInstrument');
    
    res.json({
      success: true,
      session
    });
  } else {
    // Get all active sessions using the isActive index
    // Use lean() for better performance when just reading data
    const sessions = await Session.find({ isActive: true })
      .lean()
      .sort({ createdAt: -1 })
      .populate('admin', 'username')
      .populate('activeSong', 'title artist')
      .select('-connectedUsers');
    
    // Add connected users count
    const sessionsWithCount = await Promise.all(
      sessions.map(async (session) => {
        const fullSession = await Session.findById(session._id);
        return {
          ...session,
          connectedUsers: fullSession.connectedUsers.length
        };
      })
    );
    
    res.json({
      success: true,
      sessions: sessionsWithCount
    });
  }
});

/**
 * @desc    Get session by ID
 * @route   GET /api/sessions/:id
 * @access  Private
 */
const getSessionById = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }
  
  const session = await Session.findById(req.params.id)
    .populate('admin', 'username')
    .populate('activeSong', 'title artist language')
    .populate('connectedUsers.user', 'username instrument otherInstrument');
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
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
  
  const { name } = req.body;
  
  // Create session
  const session = await Session.create({
    name: name || `Rehearsal ${new Date().toLocaleString()}`,
    admin: req.user._id,
    isActive: true
  });
  
  // Populate admin details
  await session.populate('admin', 'username');
  
  // Get Socket.io instance to emit events
  const io = req.app.get('io');
  if (io) {
    io.emit('session_created', {
      sessionId: session._id,
      name: session.name,
      admin: session.admin
    });
  }
  
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
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }
  
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
  
  // HTTP join doesn't require socket ID - will be added via WebSocket connection
  // But we can prepare the response with current session state
  
  res.json({
    success: true,
    message: 'Joined session successfully',
    session: {
      id: session._id,
      name: session.name,
      activeSong: session.activeSong,
      isActive: session.isActive,
      connectedUsers: session.connectedUsers.length
    }
  });
});

/**
 * @desc    End a session
 * @route   POST /api/sessions/:id/end
 * @access  Private/Admin
 */
const endSession = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }
  
  const session = await Session.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  // Verify user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Only admin users can end sessions'
    });
  }
  
  // Check if user is the session admin
  if (session.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the session admin can end this session'
    });
  }
  
  // End the session
  session.isActive = false;
  session.endedAt = new Date();
  await session.save();
  
  // Get Socket.io instance to emit events
  const io = req.app.get('io');
  if (io) {
    io.to(session._id.toString()).emit('session_ended', { 
      sessionId: session._id.toString(),
      endedAt: session.endedAt
    });
  }
  
  res.json({
    success: true,
    message: 'Session ended successfully'
  });
});

/**
 * @desc    Set active song for a session
 * @route   POST /api/sessions/:id/set-song/:songId
 * @access  Private/Admin
 */
const setActiveSong = asyncHandler(async (req, res) => {
  // Validate session ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }
  
  // Validate song ObjectId format
  if (!req.params.songId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid song ID format'
    });
  }
  
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
  
  // Check if user is the session admin
  if (session.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the session admin can set active songs'
    });
  }
  
  // Check if session is active
  if (!session.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Cannot set song for inactive session'
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
 * @desc    Clear active song for a session
 * @route   POST /api/sessions/:id/clear-song
 * @access  Private/Admin
 */
const clearActiveSong = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }
  
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
  
  // Check if user is the session admin
  if (session.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the session admin can clear active songs'
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

/**
 * @desc    Get connected users in a session
 * @route   GET /api/sessions/:id/users
 * @access  Private
 */
const getSessionUsers = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }
  
  const session = await Session.findById(req.params.id)
    .populate('connectedUsers.user', 'username instrument otherInstrument');
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  res.json({
    success: true,
    users: session.connectedUsers.map(connection => ({
      id: connection.user._id,
      username: connection.user.username,
      instrument: connection.user.instrument,
      otherInstrument: connection.user.otherInstrument,
      joinedAt: connection.joinedAt
    })),
    count: session.connectedUsers.length
  });
});

module.exports = {
  getActiveSessions,
  getSessionById,
  createSession,
  joinSession,
  endSession,
  setActiveSong,
  clearActiveSong,
  getSessionUsers
};