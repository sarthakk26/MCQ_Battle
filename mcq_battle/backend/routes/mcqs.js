// routes/mcqs.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Mcq = require('../models/mcq');

// Add new MCQ
router.post('/add', auth, async (req, res) => {
  try {
    const mcq = new Mcq(req.body);
    await mcq.save();
    res.status(201).json(mcq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all MCQs
router.get('/', auth, async (req, res) => {
  try {
    const mcqs = await Mcq.find();
    res.json(mcqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an MCQ
router.put('/:id', auth, async (req, res) => {
  try {
    const mcq = await Mcq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(mcq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an MCQ
router.delete('/:id', auth, async (req, res) => {
  try {
    await Mcq.findByIdAndDelete(req.params.id);
    res.json({ message: 'MCQ deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
