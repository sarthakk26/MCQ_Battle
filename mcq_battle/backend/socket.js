const { Server } = require('socket.io');
const Game = require('./models/Game');
const mcq = require('./models/mcq');
const User = require('./models/User');

let io;

const updateScoreAndEmit = async (gameId, userId, score) => {
  const game = await Game.findById(gameId);

  if (!game) {
    console.error('Game not found');
    return;
  }

  const scoreEntry = game.scores.find(entry => entry.user.toString() === userId.toString());
  if (scoreEntry) {
    scoreEntry.score = score;
  } else {
    game.scores.push({ user: userId, score });
  }

  await game.save();

  const populatedGame = await Game.findById(gameId).populate("scores.user", "username");

  io.to(gameId).emit('scoreUpdate', populatedGame.scores);
};

const endGameForPlayer = async (gameId, userId) => {
  try {
    const game = await Game.findById(gameId).populate('scores.user', 'username');
    if (!game) throw new Error('Game not found');

    const player = game.scores.find(score => score.user._id.toString() === userId.toString());
    console.log("player found", player);
    if (!player) throw new Error('Player not found in game');

    console.log('Ending game for player:', userId);
    player.endTime = new Date();
    await game.save();

    if (!io) throw new Error('Socket.io not initialized'); // Check if io is initialized
    io.to(gameId).emit('RequestLeaderboard', gameId);
  } catch (error) {
    console.error('Error ending game for player:', error);
  }
};

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinRequest', async ({ gameId, userId, socketId }) => {
        if (!gameId) {
          console.error('Invalid game ID for joinRequest');
          return;
        }
        console.log('Join request received:', gameId, userId, socketId);
        const game = await Game.findById(gameId).populate('owner');
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        const RequestedUser= await User.findById(userId).select('username');
        const username = RequestedUser.username;
        io.to(gameId.toString()).emit('joinRequestVal', { gameId, userId, socketId, username });
      });

      socket.on('respondToJoinRequest', async ({ gameId, userId, accept, socketId }) => {
        if (!gameId || !userId) {
          console.error('Invalid game or user ID for respondToJoinRequest');
          return;
        }

        const game = await Game.findById(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        if (accept) {
          game.participants.push(userId);
          await game.save();
          io.to(socketId.toString()).emit('joinRequestResponse', { accepted: true, gameId });
        } else {
          io.to(socketId.toString()).emit('joinRequestResponse', { accepted: false });
        }
      });

      socket.on('joinGame', async (gameId) => {
        if (!gameId) {
          console.error('Invalid game ID for joinGame');
          return;
        }

        const game = await Game.findById(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        socket.join(gameId);
        console.log(`Client ${socket.id} joined game ${gameId}`);

        if (game.status === 'active' && game.currentQuestionIndex < game.questions.length) {
          const question = await mcq.findById(game.questions[game.currentQuestionIndex]);
          if (question) {
            socket.emit('question', question);
          }
        }

        const populatedGame = await Game.findById(gameId).populate("scores.user", "username");
        socket.emit('scoreUpdate', populatedGame.scores);
      });

      socket.on('gameStarted', async ({ game }) => {
        io.to(game._id.toString()).emit('gameStarted', { game });
      });

      socket.on('requestLeaderboard', async (gameId) => {
        try {
          console.log("leaderboard requested");
          const game = await Game.findById(gameId).populate('scores.user', 'username');
          if (!game) throw new Error('Game not found');

          const leaderboard = game.scores.map(score => ({
            username: score.user.username,
            score: score.score,
            timeTaken: score.endTime ? (score.endTime - score.startTime) / 1000 : null,
          }));

          leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

          console.log(leaderboard);
          io.to(gameId).emit('updateLeaderboard', leaderboard);
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        }
      });

      socket.on('endGame', async (gameId) => {
        try {
          const game = await Game.findById(gameId).populate('scores.user', 'username');
           if (!game) throw new Error('Game not found');
        } catch (error) {
          console.error('Error ending game:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  updateScoreAndEmit,
  endGameForPlayer,
};
