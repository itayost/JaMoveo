// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, admin, rateLimit } = require('../middleware/authMiddleware');

// Apply rate limiting to auth routes to prevent brute force attacks
const authLimiter = rateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// Public routes
router.post('/register', authLimiter, authController.registerUser);
router.post('/admin-register', authLimiter, authController.registerAdmin);
router.post('/login', authLimiter, authController.loginUser);
router.get('/verify', authController.verifyToken);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.post('/create-admin', protect, admin, authController.createAdmin);

module.exports = router;