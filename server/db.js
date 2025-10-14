/**
 * =============================================================================
 * DATABASE CONNECTION - MONGODB ATLAS
 * =============================================================================
 * 
 * This file handles MongoDB connection using Mongoose for the Express backend.
 * It reads the MONGO_URI from environment variables and provides
 * connection management with error handling.
 * 
 * CONFIGURATION:
 * ==============
 * The MongoDB connection is configured via the MONGO_URI environment variable:
 * - For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
 * - For local Docker: mongodb://localhost:27017/database
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * 1. Update MONGO_URI in your .env file
 * 2. For Render deployment, set MONGO_URI in Render dashboard environment variables
 * 3. Restart your application
 * 
 * SWITCHING BETWEEN ATLAS AND LOCAL:
 * ==================================
 * - MongoDB Atlas (Production): Use the full connection string from Atlas dashboard
 * - Local Docker (Development): Use mongodb://localhost:27017/myapp_db
 * - Another PC: Replace localhost with the IP address of the target machine
 */

const mongoose = require('mongoose');
require('dotenv').config();

// =============================================================================
// CONNECTION STATE MANAGEMENT
// =============================================================================

let isConnected = false;
let isConnecting = false;

// =============================================================================
// MONGODB CONNECTION FUNCTION
// =============================================================================

/**
 * Connect to MongoDB using Mongoose
 * 
 * TO CHANGE MONGODB LOCATION:
 * Update the MONGO_URI environment variable in your .env file or Render dashboard.
 * 
 * EXAMPLES:
 * - MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db
 * - Local Docker: mongodb://localhost:27017/myapp_db
 * - Another PC: mongodb://192.168.1.100:27017/myapp_db
 */
async function connectToMongoDB() {
  // Check if already connected
  if (isConnected) {
    console.log('✅ MongoDB: Already connected');
    return;
  }

  // Check if already connecting
  if (isConnecting) {
    console.log('⏳ MongoDB: Connection in progress...');
    return;
  }

  // Get MongoDB URI from environment variables
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    const error = new Error('MONGO_URI environment variable is not set');
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('📝 Please set MONGO_URI in your .env file');
    throw error;
  }

  try {
    isConnecting = true;
    console.log('🔄 MongoDB: Connecting to database...');
    
    // Hide credentials in logs for security
    const safeUri = mongoUri.replace(/\/\/.*@/, '//***:***@');
    console.log(`📍 MongoDB: URI: ${safeUri}`);

    // Connect to MongoDB with optimized options
    await mongoose.connect(mongoUri, {
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    isConnected = true;
    isConnecting = false;
    
    console.log('✅ MongoDB Connected');
    console.log(`📊 MongoDB: Database name: ${mongoose.connection.db?.databaseName || 'unknown'}`);

  } catch (error) {
    isConnecting = false;
    isConnected = false;
    
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('🔧 Troubleshooting steps:');
    console.error('   1. Check your MONGO_URI in .env file');
    console.error('   2. Verify MongoDB Atlas cluster is running');
    console.error('   3. Check network connectivity');
    console.error('   4. For local development, ensure Docker container is running');
    
    throw error;
  }
}

// =============================================================================
// CONNECTION EVENT HANDLERS
// =============================================================================

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB: Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB: Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB: Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB: Connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB: Error closing connection:', error);
    process.exit(1);
  }
});

// =============================================================================
// CONNECTION STATUS FUNCTIONS
// =============================================================================

/**
 * Check if MongoDB is connected
 */
function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB connection status
 */
function getMongoDBStatus() {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    isConnected: isConnected,
    isConnecting: isConnecting,
    readyState: mongoose.connection.readyState,
    readyStateText: readyStateMap[mongoose.connection.readyState] || 'unknown',
  };
}

/**
 * Disconnect from MongoDB
 */
async function disconnectFromMongoDB() {
  try {
    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('🔌 MongoDB: Successfully disconnected from database');
    }
  } catch (error) {
    console.error('❌ MongoDB: Error disconnecting:', error);
    throw error;
  }
}

// =============================================================================
// CONNECTION TEST FUNCTION
// =============================================================================

/**
 * Test MongoDB connection
 * Use this to verify your MongoDB configuration is correct
 */
async function testMongoDBConnection() {
  try {
    console.log('🧪 MongoDB: Testing connection...');
    
    if (!isMongoDBConnected()) {
      await connectToMongoDB();
    }
    
    // Test with a simple ping
    await mongoose.connection.db?.admin().ping();
    console.log('✅ MongoDB: Connection test successful');
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB: Connection test failed:', error);
    return false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  connectToMongoDB,
  isMongoDBConnected,
  getMongoDBStatus,
  disconnectFromMongoDB,
  testMongoDBConnection,
};
