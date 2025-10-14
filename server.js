/**
 * =============================================================================
 * SERVER INITIALIZATION
 * =============================================================================
 * 
 * This file initializes the server and database connection.
 * It should be imported in your main application file to ensure
 * MongoDB connection is established before the app starts.
 * 
 * USAGE:
 * ======
 * Import this file in your main app file:
 * require('./server');
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file or Render dashboard.
 */

const { connectToMongoDB, testMongoDBConnection } = require('./db');

/**
 * Initialize server and database connection
 * 
 * TO CHANGE MONGODB LOCATION:
 * Update MONGO_URI in your .env file:
 * - MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db
 * - Local Docker: mongodb://localhost:27017/myapp_db
 * - Another PC: mongodb://192.168.1.100:27017/myapp_db
 */
async function initializeServer() {
  try {
    console.log('🚀 Initializing server...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Test the connection
    const isConnected = await testMongoDBConnection();
    
    if (isConnected) {
      console.log('🎉 Server initialization completed successfully!');
      console.log('📡 MongoDB Atlas connection established');
    } else {
      throw new Error('Failed to establish MongoDB connection');
    }
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
    console.error('🔧 Please check your MongoDB configuration');
    process.exit(1);
  }
}

// Initialize server when this file is imported
initializeServer();

module.exports = {
  initializeServer,
};
