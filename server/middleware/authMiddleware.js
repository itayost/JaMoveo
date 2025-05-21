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

/**
 * Middleware factory for role-based access control
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    if (roles.includes('admin') && req.user.isAdmin) {
      return next();
    }

    if (roles.includes(req.user.instrument)) {
      return next();
    }

    res.status(403);
    throw new Error(`Access denied: Required role(s): ${roles.join(', ')}`);
  };
};

/**
 * Middleware to limit rate of requests
 * @param {number} limit - Maximum number of requests
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
const rateLimit = (limit = 100, windowMs = 15 * 60 * 1000) => {
  const requestCounts = new Map();
  const resetTimers = new Map();
  
  return (req, res, next) => {
    // Get IP address
    const ip = req.ip || req.connection.remoteAddress;
    
    // Initialize rate limit count for this IP if not exists
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, 1);
      
      // Set timer to reset count after window
      const timerId = setTimeout(() => {
        requestCounts.delete(ip);
        resetTimers.delete(ip);
      }, windowMs);
      
      resetTimers.set(ip, timerId);
    } else {
      // Increment count
      requestCounts.set(ip, requestCounts.get(ip) + 1);
    }
    
    // Get current count
    const currentRequests = requestCounts.get(ip);
    
    // Set headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentRequests));
    
    // Check if over limit
    if (currentRequests > limit) {
      res.status(429);
      throw new Error('Too many requests, please try again later');
    }
    
    next();
  };
};

module.exports = { protect, admin, checkRole, rateLimit };