// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, admin } = require('../middleware/authmiddleware');

// Regular user registration
router.post('/register', authController.registerUser);

// Admin user registration (with admin code in .env)
router.post('/admin-register', authController.registerAdmin);

// Create additional admin (only existing admins can create other admins)
router.post('/create-admin', protect, admin, authController.createAdmin);

// User login
router.post('/login', authController.loginUser);

// Get current user (for testing auth)
router.get('/me', protect, authController.getMe);

// Logout user
router.post('/logout', protect, authController.logout);

module.exports = router;