// server/routes/song.routes.js
const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const { protect } = require('../middleware/authMiddleware');

// Song routes
router.get('/', protect, songController.getSongs); // Search songs
router.get('/:id', protect, songController.getSongById); // Get single song

module.exports = router;