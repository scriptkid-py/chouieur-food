// Test MongoDB Atlas connection
require('dotenv').config();

const { connectToMongoDB, getConnectionStatus } = require('./config/database');
const MenuItem = require('./models/MenuItem');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    
    // Set the connection string
    process.env.MONGO_URI = 'mongodb+srv://ammizaidghost_db_user:hkkCoMiLSr86kpn4@cluster0.p1rvxol.mongodb.net/chouieur-express?retryWrites=true&w=majority';
    
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    
    if (connected) {
      console.log('✅ MongoDB Atlas connection successful!');
      
      // Test database operations
      const menuItemsCount = await MenuItem.countDocuments();
      console.log(`📋 Found ${menuItemsCount} menu items in database`);
      
      // Get connection status
      const status = getConnectionStatus();
      console.log('📊 Connection Status:', status);
      
      console.log('🎉 MongoDB Atlas integration is working perfectly!');
    } else {
      console.log('❌ Failed to connect to MongoDB Atlas');
    }
    
  } catch (error) {
    console.error('❌ Error testing connection:', error.message);
  }
  
  process.exit(0);
}

testConnection();
