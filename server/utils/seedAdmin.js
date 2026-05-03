const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@carefacility.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Email: admin@carefacility.com');
      console.log('Password: Admin@1234');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@carefacility.com',
      password: 'Admin@1234',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('----------------------------------');
    console.log('Email:    admin@carefacility.com');
    console.log('Password: Admin@1234');
    console.log('Role:     admin');
    console.log('----------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
