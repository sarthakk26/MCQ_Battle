// config/config.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mcq_battle');

const connection = mongoose.connection;

module.exports = {
  connection,
  jwtSecret: 'my_secret_string' 
};
