/**
 * Test MongoDB Atlas connection with retry
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
  console.error('❌ Please update MONGODB_URI in .env with your actual password!');
  process.exit(1);
}

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

let retries = 3;
let delay = 2000; // 2 seconds

const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    });
    
    console.log('✅ MongoDB Atlas Connected Successfully!');
    
    // Test database access
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('✅ Database accessible');
    console.log('Collections:', collections.map(c => c.name).join(', ') || 'No collections yet');
    
    // Test User model
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`✅ User model works! Current users: ${userCount}`);
    
    process.exit(0);
  } catch (error) {
    retries--;
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('\n❌ IP Address Not Whitelisted!');
      console.error('\n📋 Steps to fix:');
      console.error('1. Go to MongoDB Atlas Dashboard');
      console.error('2. Click "Network Access"');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Add Current IP Address" (or add 0.0.0.0/0 for testing)');
      console.error('5. Wait 1-2 minutes for changes to take effect');
      console.error('6. Run this test again\n');
    } else if (error.message.includes('authentication')) {
      console.error('\n❌ Authentication Failed!');
      console.error('Check your username and password in .env file');
    } else {
      console.error('\n❌ Connection Error:', error.message);
    }
    
    if (retries > 0) {
      console.log(`\n⏳ Retrying in ${delay/1000} seconds... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry();
    } else {
      console.error('\n❌ Failed to connect after retries');
      process.exit(1);
    }
  }
};

connectWithRetry();

