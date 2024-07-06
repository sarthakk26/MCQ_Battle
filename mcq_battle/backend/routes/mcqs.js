// backend/routes/mcqs.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import auth middleware
const MCQ = require('../models/mcq');

// Add an MCQ (requires authentication)
router.post('/add', auth, async (req, res) => {
  try {
    const { question, options, correctOptionIndex } = req.body;

    const newMCQ = new MCQ({
      question,
      options,
      correctOptionIndex,
      createdBy: req.user.id // Provided by auth middleware
    });

    await newMCQ.save();
    res.status(201).json({ message: 'MCQ added successfully', mcq: newMCQ });
  } catch (error) {
    console.error('Add MCQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all MCQs (public)
router.get('/', async (req, res) => {
  try {
    const mcqs = await MCQ.find();
    res.json(mcqs);
  } catch (error) {
    console.error('Get all MCQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single MCQ by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq) return res.status(404).json({ message: 'MCQ not found' });
    res.json(mcq);
  } catch (error) {
    console.error('Get MCQ by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update MCQ (requires authentication)
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { question, options, correctOptionIndex } = req.body;

    const updatedMCQ = await MCQ.findByIdAndUpdate(
      req.params.id,
      { question, options, correctOptionIndex },
      { new: true }
    );

    if (!updatedMCQ) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    res.json({ message: 'MCQ updated successfully', mcq: updatedMCQ });
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete MCQ (requires authentication)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const deletedMCQ = await MCQ.findByIdAndDelete(req.params.id);
    if (!deletedMCQ) {
      return res.status(404).json({ message: 'MCQ not found' });
    }
    res.json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    console.error('Delete MCQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
