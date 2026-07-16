const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id/notes - Get all notes by a user
router.get('/:id/notes', async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.params.id, isPublic: true });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/profile - Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('uploadedNotes', 'title subject downloads')
      .populate('savedNotes', 'title subject');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/save/:noteId - Save a note
router.post('/save/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedNotes.includes(req.params.noteId);
    if (alreadySaved) {
      user.savedNotes = user.savedNotes.filter(id => id.toString() !== req.params.noteId);
    } else {
      user.savedNotes.push(req.params.noteId);
    }
    await user.save();
    res.json({ saved: !alreadySaved, savedNotes: user.savedNotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
