// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if not token
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const tokenValue = token.replace('Bearer ', '');
    const decoded = jwt.verify(tokenValue, config.jwtSecret);

    // Fetch user by username from database
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Add user object to request object
    req.user = user;

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(400).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
