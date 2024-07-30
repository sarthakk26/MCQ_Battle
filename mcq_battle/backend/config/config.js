// config/config.js
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sarthakk26:Sarthak%4026@mcq-battel.bwc5jks.mongodb.net/');

const connection = mongoose.connection;

module.exports = {
  connection,
  jwtSecret: 'my_secret_string' 
};
