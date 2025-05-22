// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, admin} = require('../middleware/authMiddleware');



// Public routes
router.post('/register', authController.registerUser);
router.post('/admin-register', authController.registerAdmin);
router.post('/login', authController.loginUser);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;