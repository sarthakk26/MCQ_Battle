// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  await mongoose.connect('mongodb://localhost:27017/mcq_battle', {
  });

  const username = 'admin'; // Replace with desired username
  const password = 'admin'; // Replace with desired password

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = new Admin({ username, password: hashedPassword });

  await admin.save();
  console.log('Admin created successfully');

  mongoose.disconnect();
};

createAdmin();
