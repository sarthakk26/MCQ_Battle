// config/config.js
require ('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const connection = mongoose.connection;

module.exports = {
  connection,
  jwtSecret: process.env.JWT_SECRET 
};
