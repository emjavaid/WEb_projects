const express = require('express');
const Note = require('../models/Note');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/notes - Get all notes (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { subject, search, sort } = req.query;
    let query = { isPublic: true };
    if (subject) query.subject = subject;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];

    let sortOption = { createdAt: -1 };
    if (sort === 'downloads') sortOption = { downloads: -1 };
    if (sort === 'rating') sortOption = { 'ratings.length': -1 };

    const notes = await Note.find(query).sort(sortOption).populate('uploader', 'name rollNumber');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploader', 'name rollNumber');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes - Create new note (auth required)
router.post('/', protect, async (req, res) => {
  try {
    const { title, subject, description, content, tags } = req.body;
    if (!title || !subject || !description || !content) {
      return res.status(400).json({ message: 'Title, subject, description and content are required' });
    }
    const note = await Note.create({
      title, subject, description, content,
      tags: tags || [],
      uploader: req.user._id,
      uploaderName: req.user.name,
    });
    await User.findByIdAndUpdate(req.user._id, { $push: { uploadedNotes: note._id } });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notes/:id - Update note (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this note' });
    }
    const { title, subject, description, content, tags } = req.body;
    Object.assign(note, { title, subject, description, content, tags });
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notes/:id - Delete note (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }
    await note.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { uploadedNotes: note._id } });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes/:id/rate - Rate a note
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const existing = note.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existing) {
      existing.value = value;
    } else {
      note.ratings.push({ user: req.user._id, value });
    }
    await note.save();
    res.json({ averageRating: note.averageRating, totalRatings: note.ratings.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes/:id/comment - Add a comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.comments.push({ user: req.user._id, userName: req.user.name, text });
    await note.save();
    res.status(201).json(note.comments[note.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes/:id/download - Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ downloads: note.downloads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
