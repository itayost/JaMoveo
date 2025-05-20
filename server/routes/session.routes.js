// server/routes/session.routes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect, admin, checkRole } = require('../middleware/auth.middleware');

// Routes for all authenticated users
router.get('/active', protect, sessionController.getActiveSessions); // Get active sessions
router.get('/:id', protect, sessionController.getSessionById); // Get session by ID
router.post('/:id/join', protect, sessionController.joinSession); // Join session
router.post('/:id/leave', protect, sessionController.leaveSession); // Leave session

// Routes restricted to admins
router.post('/', protect, admin, sessionController.createSession); // Create session
router.post('/:id/end', protect, admin, sessionController.endSession); // End session
router.delete('/:id', protect, admin, sessionController.deleteSession); // Delete session

module.exports = router;