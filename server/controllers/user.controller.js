// server/controllers/user.controller.js
const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get current user profile
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
      isAdmin: req.user.isAdmin
    }
  });
});

/**
 * @desc    Update user instrument
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Only allow updating instrument - the main feature needed for the app
  if (req.body.instrument) {
    // Validate instrument
    const validInstruments = ['guitar', 'bass', 'drums', 'vocals', 'keyboard', 'saxophone', 'other'];
    if (!validInstruments.includes(req.body.instrument)) {
      res.status(400);
      throw new Error(`Invalid instrument. Must be one of: ${validInstruments.join(', ')}`);
    }
    
    user.instrument = req.body.instrument;
    
    // Handle 'other' instrument type
    if (req.body.instrument === 'other' && req.body.otherInstrument) {
      user.otherInstrument = req.body.otherInstrument;
    }
  }

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

module.exports = {
  getUserProfile,
  updateUserProfile
};