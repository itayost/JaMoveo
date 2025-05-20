// server/controllers/session.controller.js
const Session = require('../models/session.model');
const User = require('../models/user.model');

// @desc    Get active sessions
// @route   GET /api/sessions/active
// @access  Private
const getActiveSessions = async (req, res) => {
  try {
    const { latest } = req.query;
    
    if (latest === 'true') {
      // Get most recent active session using the isActive + createdAt index
      const session = await Session.findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('admin', 'username')
        .populate('activeSong', 'title artist')
        .populate('connectedUsers.user', 'username instrument');
      
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
        .select('-connectedUsers');
      
      res.json({
        success: true,
        sessions
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

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('admin', 'username')
      .populate('activeSong', 'title artist')
      .populate('connectedUsers.user', 'username instrument');
    
    if (session) {
      res.json({
        success: true,
        session
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Session not found'
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

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private/Admin
const createSession = async (req, res) => {
  try {
    const { name } = req.body;
    
    const session = await Session.create({
      name: name || undefined,
      admin: req.user._id,
      isActive: true
    });
    
    // Populate admin details
    await session.populate('admin', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session
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

// @desc    Join a session
// @route   POST /api/sessions/:id/join
// @access  Private
const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('activeSong', 'title artist');
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found'
      });
      return;
    }
    
    if (!session.isActive) {
      res.status(400).json({
        success: false,
        message: 'Session is not active'
      });
      return;
    }
    
    // HTTP join doesn't require socket ID - will be added via WebSocket connection
    
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    End a session
// @route   POST /api/sessions/:id/end
// @access  Private/Admin
const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found'
      });
      return;
    }
    
    // Check if user is the session admin
    if (session.admin.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Only the session admin can end this session'
      });
      return;
    }
    
    // End the session
    await session.endSession();
    
    res.json({
      success: true,
      message: 'Session ended successfully'
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

module.exports = {
  getActiveSessions,
  getSessionById,
  createSession,
  joinSession,
  endSession
};