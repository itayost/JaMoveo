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

module.exports = {
  getActiveSession,
  createSession,
  joinSession
};