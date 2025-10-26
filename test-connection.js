// Simple MongoDB Connection Test
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ammizaidghost_db_user:hkkCoMiLSr86kpn4@cluster0.p1rvxol.mongodb.net/chouieur-express?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('📍 URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('🗄️  Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Test MenuItem collection
    const MenuItem = require('./models/MenuItem');
    const menuCount = await MenuItem.countDocuments();
    console.log('🍽️  Menu Items:', menuCount);
    
    // Test Order collection
    const Order = require('./models/Order');
    const orderCount = await Order.countDocuments();
    console.log('📦 Orders:', orderCount);
    
    // Test User collection
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log('👥 Users:', userCount);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
