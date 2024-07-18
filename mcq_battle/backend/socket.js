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
    
      // Handle client joining a game
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
        
        // If the game is active, send the current question
        if (game.status === 'active' && game.currentQuestionIndex < game.questions.length) {
          const question = await mcq.findById(game.questions[game.currentQuestionIndex]);
          if (question) {
            socket.emit('question', question);
          }
        }

        // Emit the current scores
        const populatedGame = await Game.findById(gameId).populate("scores.user", "username");
        socket.emit('scoreUpdate', populatedGame.scores);
      });

      // Handle gameStarted event
      socket.on('gameStarted', async ({ game }) => {
        io.to(game._id.toString()).emit('gameStarted', { game });
      });

      // Handle client disconnecting
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
  updateScoreAndEmit // Export the function
};
