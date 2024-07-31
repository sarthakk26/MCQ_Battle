// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');


const createAdmin = async () => {

   console.log('MONGODB_URI:', process.env.MONGODB_URI); // Log to verify
   console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log to verify

   await mongoose.connect(process.env.MONGODB_URI); // Use the correct variable name

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