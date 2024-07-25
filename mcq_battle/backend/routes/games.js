const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Game = require('../models/Game');
const mcq = require('../models/mcq');
const { getIo, updateScoreAndEmit,endGameForPlayer } = require('../socket'); // Import getIo from socket.js
const User = require('../models/User');

// Function to generate random questions
const getRandomQuestions = async (count) => {
  return mcq.aggregate([{ $sample: { size: 5 } }]);
};

// POST /api/games - Create a new game
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newGame = new Game({
      owner: req.user.id,
      ownerName: user.username,
      participants: [req.user.id],
      status: 'waiting',
    });

    await newGame.save();

    const io = getIo();
    io.emit('newGame', newGame); // Emit an event when a new game is created

    res.status(201).json({ message: 'Game created successfully', game: newGame });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/games/waiting - Get all waiting games
router.get('/waiting', auth, async (req, res) => {
  try {
    const games = await Game.find({ status: 'waiting' }).populate('owner', 'username');
    res.json(games);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/games/:gameId/join - Join a game
router.post('/:gameId/join', auth, async (req, res) => {
  try {
    const gameId = req.params.gameId;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Game is not open for joining' });
    }

    if (!game.participants.includes(req.user.id)) {
      game.participants.push(req.user.id);
      await game.save();

      // Notify other participants that a new player has joined
      const io = getIo();
      io.to(game._id.toString()).emit('playerJoined', { playerId: req.user.id });
    }

    res.status(200).json({ message: 'Joined game successfully', game });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/games/:gameId - Get game details
router.get('/:gameId', auth, async (req, res) => {
  const { gameId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: 'Invalid game ID' });
  }

  try {
    const game = await Game.findById(gameId)
      .populate('participants', 'username')
      .populate('owner', 'username');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/games/:gameId/start - Start the game
router.post('/:gameId/start', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the game owner can start the game' });
    }

    game.status = 'active';
    const questionSequence = await getRandomQuestions(5); // Adjust the number of questions as needed
    game.questions = questionSequence.map(q => q._id);
    game.currentQuestionIndex = 0;

    // Initialize scores for all participants
    game.participants.forEach(participant => {
      game.scores.push({ user: participant, score: 0 });
    });

    await game.save();

    const io = getIo();
    io.to(game._id.toString()).emit('gameStarted', { question: questionSequence[0], scores: game.scores });

    res.status(200).json({ message: 'Game started', question: questionSequence[0], scores: game.scores });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/games/:gameId/answer - Submit an answer
router.post('/:gameId/answer', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { answer, questionId } = req.body;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    if (!game.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a participant in this game' });
    }

    const question = await mcq.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    let correct = false;
    if (question.options[question.correctOptionIndex] === answer) {
      correct = true;
      const participant = game.scores.find(score => score.user.toString() === req.user.id);
      const newScore = participant ? participant.score + 1 : 1;

      // Update score and emit to all participants
      await updateScoreAndEmit(gameId, req.user.id, newScore);
    }

    // Move to the next question for this participant
    game.participantProgress.set(req.user.id, game.participantProgress.get(req.user.id) + 1 || 1);

    const nextQuestionIndex = game.participantProgress.get(req.user.id);
    let nextQuestion = null;

    if (nextQuestionIndex < game.questions.length) {
      nextQuestion = await mcq.findById(game.questions[nextQuestionIndex]);
    }

    if (!nextQuestion) {
      game.status = 'completed';
      const io = getIo();
      io.to(game._id.toString()).emit('gameEnded');
    } else {
      const io = getIo();
      io.to(game._id.toString()).emit('nextQuestion', { question: nextQuestion, userId: req.user.id });
    }

    await game.save();
    res.status(200).json({ correct, nextQuestion });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// POST /api/games/:gameId/end - End the game
// POST /api/games/:gameId/end - End the game
router.post('/:gameId/end', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.status = 'completed';
    await game.save();

    // Call endGameForPlayer for all players
    await endGameForPlayer(req.params.gameId, req.user.id);
    

    // const io = getIo();
    // io.to(game._id.toString()).emit('RequestLeaderboard', game._id);

    res.status(200).json({ message: 'Game ended successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
