// server/routes/session.routes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect, admin } = require('../middleware/authmiddleware');

// Routes for all authenticated users
router.get('/active', protect, sessionController.getActiveSessions); // Get active sessions
router.get('/:id', protect, sessionController.getSessionById); // Get session by ID
router.post('/:id/join', protect, sessionController.joinSession); // Join session
router.get('/:id/users', protect, sessionController.getSessionUsers); // Get session users

// Routes restricted to admins
router.post('/', protect, admin, sessionController.createSession); // Create session
router.post('/:id/end', protect, admin, sessionController.endSession); // End session
router.post('/:id/set-song/:songId', protect, admin, sessionController.setActiveSong); // Set active song
router.post('/:id/clear-song', protect, admin, sessionController.clearActiveSong); // Clear active song

module.exports = router;