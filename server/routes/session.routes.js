// server/routes/session.routes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect, admin } = require('../middleware/authMiddleware');

// Streamlined session routes
router.get('/active', protect, sessionController.getActiveSession);
router.post('/', protect, admin, sessionController.createSession);
router.post('/:id/join', protect, sessionController.joinSession);
router.post('/:id/set-song/:songId', protect, admin, sessionController.setActiveSong);
router.post('/:id/clear-song', protect, admin, sessionController.clearActiveSong);

module.exports = router;