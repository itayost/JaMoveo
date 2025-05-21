// server/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, password, instrument, otherInstrument } = req.body;

    // Validate request
    if (!username || !password || !instrument) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      instrument,
      otherInstrument: instrument === 'other' ? otherInstrument : undefined,
      isAdmin: false
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);

      // Set cookie if running in production
      if (process.env.NODE_ENV === 'production') {
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          instrument: user.instrument,
          otherInstrument: user.otherInstrument,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Register a new admin user with admin code
// @route   POST /api/auth/admin-register
// @access  Public (but requires admin code)
const registerAdmin = async (req, res) => {
  try {
    const { username, password, adminCode } = req.body;

    // Validate request
    if (!username || !password || !adminCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify admin code
    if (adminCode !== process.env.ADMIN_SIGNUP_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new admin user
    const user = await User.create({
      username,
      password,
      instrument: 'other',
      otherInstrument: 'Admin',
      isAdmin: true
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);

      // Set cookie if running in production
      if (process.env.NODE_ENV === 'production') {
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      res.status(201).json({
        success: true,
        message: 'Admin user registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Create admin user by existing admin
// @route   POST /api/auth/create-admin
// @access  Private/Admin
const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new admin user
    const user = await User.create({
      username,
      password,
      instrument: 'other',
      otherInstrument: 'Admin',
      isAdmin: true
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: user._id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    // Check if user exists and password is correct
    if (user && (await user.matchPassword(password))) {
      // Update last login timestamp
      user.lastLogin = Date.now();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Set cookie if running in production
      if (process.env.NODE_ENV === 'production') {
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          instrument: user.instrument,
          otherInstrument: user.otherInstrument,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
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
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// server/controllers/auth.controller.js
// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Check if cookies exist before trying to clear them
    if (req.cookies && req.cookies.token) {
      res.clearCookie('token');
    }

    // Return success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  createAdmin,
  loginUser,
  getMe,
  logout
};