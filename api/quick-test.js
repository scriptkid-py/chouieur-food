// Simple MongoDB Atlas Connection Test
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://ammizaidghost_db_user:hkkCoMiLSr86kpn4@cluster0.p1rvxol.mongodb.net/chouieur-express?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('📍 Database: chouieur-express');
    console.log('👤 User: ammizaidghost_db_user');
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    console.log('🎉 MongoDB Atlas integration is working!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testConnection();
