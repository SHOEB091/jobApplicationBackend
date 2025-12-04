const mongoose = require('mongoose');
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

async function upgradeToSuperAdmin() {
  try {
    const email = 'test@example.com';
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);
    
    // Update role to superadmin
    user.role = 'superadmin';
    await user.save();
    
    console.log('✅ User upgraded to superadmin successfully!');
    console.log('Email:', email);
    console.log('New Role:', user.role);
    console.log('\nYou can now login and access all Super Admin features!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

upgradeToSuperAdmin();
