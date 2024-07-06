// server.js
const express = require('express');
const http = require('http');
const mongoose = require('./config/config').connection;
const authRoutes = require('./routes/auth');
const mcqRoutes = require('./routes/mcqs');
const gamesRoutes = require('./routes/games');
const bodyParser = require('body-parser');
const { init: initializeSocket } = require('./socket');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Use CORS middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize socket.io and pass the server
initializeSocket(server);

app.use('/api/auth', authRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/games', gamesRoutes);

mongoose.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
