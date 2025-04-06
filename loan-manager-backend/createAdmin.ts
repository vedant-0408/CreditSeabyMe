import mongoose from 'mongoose';
import User, { UserRole } from '../loan-manager-backend/src/models/User';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Admin user details - you can change these as needed
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123'; // You should use a stronger password in production
const ADMIN_USERNAME = 'admin';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loan-manager');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Hash the password
    //   const salt = await bcrypt.genSalt(10);
    //   const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create new admin user
      const adminUser = new User({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: UserRole.ADMIN
      });
      
      // Save admin to database
      await adminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createAdminUser();
