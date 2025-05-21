// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to protect routes - verifies JWT token
const protect = async (req, res, next) => {
  try {
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
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id from decoded token (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    // If user not found, return error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token invalid'
      });
    }

    // Add user to request object
    req.user = user;

    // Move to next middleware
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized, authentication failed'
    });
  }
};

// Middleware to restrict routes to admin users
const admin = (req, res, next) => {
  // Check if user exists and is admin
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }

  next();
};

// Middleware factory for role-based access control
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (roles.includes('admin') && req.user.isAdmin) {
      return next();
    }

    if (roles.includes(req.user.instrument)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Required role(s): ${roles.join(', ')}`
    });
  };
};

module.exports = { protect, admin, checkRole };