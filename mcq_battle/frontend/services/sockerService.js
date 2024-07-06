// frontend/services/socketService.js

import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL

const socketService = {
  connectToGame: (gameId, onQuestion, onError) => {
    socket.emit('joinGame', gameId);

    socket.on('question', onQuestion);
    socket.on('error', onError);

    return () => {
      socket.off('question', onQuestion);
      socket.off('error', onError);
    };
  },
};

export default socketService;
