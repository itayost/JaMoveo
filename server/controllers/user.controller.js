// server/controllers/user.controller.js
const User = require('../models/user.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
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
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
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

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.json({
      success: true,
      users
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.username = req.body.username || user.username;
      user.instrument = req.body.instrument || user.instrument;
      
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
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      await User.deleteOne({ _id: user._id }); // Using deleteOne instead of remove() which is deprecated
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
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
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};