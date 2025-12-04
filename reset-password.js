const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    const email = 'test@example.com';
    const newPassword = 'password123';
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      console.log('\nCreating new user...');
      
      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const newUser = await User.create({
        name: 'Test User',
        email: email,
        password: hashedPassword,
        role: 'user'
      });
      
      console.log('✅ New user created successfully!');
      console.log('Email:', email);
      console.log('Password:', newPassword);
    } else {
      console.log(`Found user: ${user.name} (${user.email})`);
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Password reset successfully!');
      console.log('Email:', email);
      console.log('New Password:', newPassword);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
