// backend/models/MCQ.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mcqSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String], // Array of strings for options
    required: true
  },
  correctOptionIndex: {
    type: Number, // Index of the correct option in the options array
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('mcq', mcqSchema);
