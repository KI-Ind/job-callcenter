/**
 * Script to create or update admin users in the database
 * Run with: node src/scripts/create-admin-users.js
 */

const mongoose = require('mongoose');
const User = require('../models/user.model');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Admin users configuration
const adminUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'you@kifwat.com',
    password: 'Kifwat@12345..0',
    role: 'admin'
  },
  {
    firstName: 'Riwan',
    lastName: 'Ahmad',
    email: 'riwan.ahmad@kifwat.com',
    password: 'Kifwat@12345..0',
    role: 'admin'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createOrUpdateAdminUsers = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    console.log('Starting admin users creation/update process...');
    
    for (const adminData of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: adminData.email });
      
      if (existingUser) {
        console.log(`User with email ${adminData.email} already exists. Updating role to admin...`);
        
        // Update user to ensure they have admin role
        existingUser.role = 'admin';
        
        // Only update password if explicitly requested (commented out by default for security)
        // Uncomment the next line if you want to force update the password
        // existingUser.password = adminData.password;
        
        await existingUser.save();
        console.log(`User ${adminData.email} updated successfully.`);
      } else {
        console.log(`Creating new admin user: ${adminData.email}`);
        
        // Create new admin user
        const newAdmin = new User({
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email,
          password: adminData.password,
          role: adminData.role,
          isVerified: true // Admin users are verified by default
        });
        
        await newAdmin.save();
        console.log(`Admin user ${adminData.email} created successfully.`);
      }
    }
    
    console.log('Admin users creation/update process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating/updating admin users:', error);
    process.exit(1);
  }
};

// Run the function
createOrUpdateAdminUsers();
