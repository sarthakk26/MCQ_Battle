// socket.js
const { Server } = require('socket.io');
const Game = require('./models/Game');
const mcq = require('./models/mcq');

let io;

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
      });

      // Handle gameStarted event
      socket.on('gameStarted', async ({ game }) => {
        //{socket.join(game._id);}

        // Emit the 'gameStarted' event to all participants
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
};
