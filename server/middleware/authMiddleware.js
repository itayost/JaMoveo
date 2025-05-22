// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { asyncHandler } = require('./errorMiddleware');

/**
 * Middleware to protect routes - verifies JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Optionally check for token in cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found, return error
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id from decoded token (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    // If user not found, return error
    if (!user) {
      res.status(401);
      throw new Error('User not found or token invalid');
    }

    // Add user to request object
    req.user = user;

    // Update last active timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Move to next middleware
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Token expired');
    }
    
    res.status(401);
    throw new Error('Not authorized');
  }
});

/**
 * Middleware to restrict routes to admin users
 */
const admin = (req, res, next) => {
  // Check if user exists and is admin
  if (!req.user) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Admin privileges required');
  }

  next();
};

module.exports = 
{ protect,
 admin};