// server/routes/session.routes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect, admin } = require('../middleware/authMiddleware');

// Streamlined session routes
router.get('/active', protect, sessionController.getActiveSession);
router.post('/', protect, admin, sessionController.createSession);
router.post('/:id/join', protect, sessionController.joinSession);

module.exports = router;