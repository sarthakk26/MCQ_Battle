const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'mcq' }], // Store question IDs
  currentQuestionIndex: { type: Number, default: 0 },
  scores: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
  }],
  gameMode: { type: String, required: true },
  participantProgress: { type: Map, of: Number, default: {} }, // Track each participant's question index
  status: { type: String, default: 'waiting' },
});

module.exports = mongoose.model('Game', gameSchema);
