

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createSuperadmin = async () => {
  try {
    await connectDB();

    const email = 'superadmin@example.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Superadmin already exists');
      
      // Update to superadmin if not already
      if (existingUser.role !== 'superadmin') {
        existingUser.role = 'superadmin';
        existingUser.adminApproved = true;
        await existingUser.save();
        console.log('User updated to superadmin role');
      }
    } else {
      const superadmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'admin123',
        role: 'superadmin',
        adminApproved: true
      });

      console.log('Superadmin created successfully:');
      console.log('Email:', superadmin.email);
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createSuperadmin();
