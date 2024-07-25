const { Server } = require('socket.io');
const Game = require('./models/Game');
const mcq = require('./models/mcq');

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
    console.log("player found",player);
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
          //console.log("leaderboard requested");
          const game = await Game.findById(gameId).populate('scores.user', 'username');
          if (!game) throw new Error('Game not found');
          console.log("score fetched:>",game.scores);
          const leaderboard = game.scores.map(score => ({
            username: score.user.username,
            score: score.score,
            timeTaken: score.endTime ? (score.endTime - score.startTime) / 1000 : null,
          }));

          leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

          //console.log(leaderboard);
          io.to(gameId).emit('updateLeaderboard', leaderboard);
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        }
      });

      socket.on('endGame', async (gameId) => {
        try {
          const game = await Game.findById(gameId).populate('scores.user', 'username');
          if (!game) throw new Error('Game not found');
      
          //game.endTime = new Date();
          // await game.save();
      
          // const leaderboard = game.scores.map(score => ({
          //   username: score.user.username,
          //   score: score.score,
          //   timeTaken: score.endTime ? (score.endTime - score.startTime) / 1000 : null, // Calculate time taken in seconds
          // }));
      
          // leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken); // Sort by score, then by time
      
          // io.to(gameId).emit('updateLeaderboard', leaderboard);
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
