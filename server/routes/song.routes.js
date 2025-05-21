// server/routes/song.routes.js
const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes accessible to authenticated users
router.get('/', protect, songController.getSongs); // Search/get songs
router.get('/:id', protect, songController.getSongById); // Get single song

// Routes restricted to admins
router.post('/', protect, admin, songController.createSong); // Create song
router.put('/:id', protect, admin, songController.updateSong); // Update song
router.delete('/:id', protect, admin, songController.deleteSong); // Delete song

module.exports = router;