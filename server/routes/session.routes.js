const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect, admin } = require('../middleware/authMiddleware');

// Essential routes only
router.get('/active', protect, sessionController.getActiveSessions);
router.get('/:id', protect, sessionController.getSessionById);
router.post('/:id/join', protect, sessionController.joinSession);
router.post('/', protect, admin, sessionController.createSession);
router.post('/:id/end', protect, admin, sessionController.endSession);
router.post('/:id/set-song/:songId', protect, admin, sessionController.setActiveSong);
router.post('/:id/clear-song', protect, admin, sessionController.clearActiveSong);

module.exports = router;