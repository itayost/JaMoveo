// server/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Get user profile (authenticated user)
router.get('/profile', protect, userController.getUserProfile);

// Update user profile (authenticated user)
router.put('/profile', protect, userController.updateUserProfile);

// Admin routes
router.get('/', protect, admin, userController.getUsers); // Get all users
router.get('/:id', protect, admin, userController.getUserById); // Get user by ID
router.put('/:id', protect, admin, userController.updateUser); // Update any user
router.delete('/:id', protect, admin, userController.deleteUser); // Delete user

module.exports = router;