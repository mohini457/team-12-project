/**
 * Quick test script to verify MongoDB connection
 * Run: node test-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parking-slot-app';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  // Test if we can access the database
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('✅ Database accessible');
  console.log('Collections:', collections.map(c => c.name).join(', ') || 'No collections yet');
  
  // Test User model
  const User = require('./models/User');
  const userCount = await User.countDocuments();
  console.log(`✅ User model works! Current users: ${userCount}`);
  
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB Connection Failed!');
  console.error('Error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Make sure MongoDB is running');
  console.error('2. Check MONGODB_URI in .env file');
  console.error('3. For local MongoDB: Verify service is running');
  console.error('4. For Atlas: Check connection string and network access');
  process.exit(1);
});

