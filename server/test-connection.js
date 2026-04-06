require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Found' : '✗ Missing');

if (!process.env.MONGO_URI) {
  console.error('❌ .env file not loading properly');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Database is ready.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
