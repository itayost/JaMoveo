// server/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, instrument, otherInstrument } = req.body;

  // Validate request
  if (!username || !password || !instrument) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate instrument
  const validInstruments = ['guitar', 'bass', 'drums', 'vocals', 'keyboard', 'saxophone', 'other'];
  if (!validInstruments.includes(instrument)) {
    res.status(400);
    throw new Error(`Invalid instrument. Must be one of: ${validInstruments.join(', ')}`);
  }

  // Check if 'other' instrument requires otherInstrument field
  if (instrument === 'other' && !otherInstrument) {
    res.status(400);
    throw new Error('Please specify your instrument when selecting "other"');
  }

  // Check if user already exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(409);
    throw new Error('Username already exists');
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
        secure: true,
        sameSite: 'strict',
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
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Register a new admin user with admin code
 * @route   POST /api/auth/admin-register
 * @access  Public (but requires admin code)
 */
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, password, adminCode } = req.body;

  // Validate request
  if (!username || !password || !adminCode) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Verify admin code
  if (adminCode !== process.env.ADMIN_SIGNUP_CODE) {
    res.status(401);
    throw new Error('Invalid admin code');
  }

  // Check if user already exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(409);
    throw new Error('Username already exists');
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
        secure: true,
        sameSite: 'strict',
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
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Create admin user by existing admin
 * @route   POST /api/auth/create-admin
 * @access  Private/Admin
 */
const createAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate request
  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  // Check if user already exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(409);
    throw new Error('Username already exists');
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
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate request
  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  // Find user by username
  const user = await User.findOne({ username });

  // Check if user exists and password is correct
  if (user && (await user.matchPassword(password))) {
    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie if running in production
    if (process.env.NODE_ENV === 'production') {
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
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
    res.status(401);
    throw new Error('Invalid username or password');
  }
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
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
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Check if cookies exist before trying to clear them
  if (req.cookies && req.cookies.token) {
    res.clearCookie('token');
  }

  // Return success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Verify token validity
 * @route   GET /api/auth/verify
 * @access  Public
 */
const verifyToken = asyncHandler(async (req, res) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(400);
    throw new Error('No token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    
    res.json({
      success: true,
      isValid: true,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    // Token is invalid or expired
    res.json({
      success: true,
      isValid: false,
      error: error.name
    });
  }
});

module.exports = {
  registerUser,
  registerAdmin,
  createAdmin,
  loginUser,
  getMe,
  logout,
  verifyToken
};