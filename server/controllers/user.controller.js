// server/controllers/user.controller.js
const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // User is already available in req.user from the protect middleware
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      instrument: req.user.instrument,
      otherInstrument: req.user.otherInstrument,
      isAdmin: req.user.isAdmin,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Validate instrument if provided
  if (req.body.instrument) {
    const validInstruments = ['guitar', 'bass', 'drums', 'vocals', 'keyboard', 'saxophone', 'other'];
    if (!validInstruments.includes(req.body.instrument)) {
      res.status(400);
      throw new Error(`Invalid instrument. Must be one of: ${validInstruments.join(', ')}`);
    }
  }
  
  // Check if 'other' instrument requires otherInstrument field
  if (req.body.instrument === 'other' && !req.body.otherInstrument && !user.otherInstrument) {
    res.status(400);
    throw new Error('Please specify your instrument when selecting "other"');
  }

  // Update fields if provided
  if (req.body.instrument) user.instrument = req.body.instrument;
  if (req.body.instrument === 'other' && req.body.otherInstrument) {
    user.otherInstrument = req.body.otherInstrument;
  }
  if (req.body.password) user.password = req.body.password;

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      username: updatedUser.username,
      instrument: updatedUser.instrument,
      otherInstrument: updatedUser.otherInstrument,
      isAdmin: updatedUser.isAdmin
    }
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  // Parse query parameters for pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Count total users
  const totalUsers = await User.countDocuments();
  
  // Get users with pagination
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({
    success: true,
    users,
    pagination: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit
    }
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }
  
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.json({
    success: true,
    user
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Validate instrument if provided
  if (req.body.instrument) {
    const validInstruments = ['guitar', 'bass', 'drums', 'vocals', 'keyboard', 'saxophone', 'other'];
    if (!validInstruments.includes(req.body.instrument)) {
      res.status(400);
      throw new Error(`Invalid instrument. Must be one of: ${validInstruments.join(', ')}`);
    }
  }
  
  // Check if 'other' instrument requires otherInstrument field
  if (req.body.instrument === 'other' && !req.body.otherInstrument && !user.otherInstrument) {
    res.status(400);
    throw new Error('Please specify instrument when selecting "other"');
  }
  
  // Update fields if provided
  if (req.body.username) user.username = req.body.username;
  if (req.body.instrument) user.instrument = req.body.instrument;
  
  if (req.body.isAdmin !== undefined) {
    user.isAdmin = req.body.isAdmin;
  }
  
  if (req.body.instrument === 'other' && req.body.otherInstrument) {
    user.otherInstrument = req.body.otherInstrument;
  }
  
  if (req.body.password) {
    user.password = req.body.password;
  }
  
  const updatedUser = await user.save();
  
  res.json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: updatedUser._id,
      username: updatedUser.username,
      instrument: updatedUser.instrument,
      otherInstrument: updatedUser.otherInstrument,
      isAdmin: updatedUser.isAdmin
    }
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  // Validate ObjectId format
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }
  
  await User.deleteOne({ _id: user._id });
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};