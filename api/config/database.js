/**
 * =============================================================================
 * MONGODB CONNECTION CONFIGURATION
 * =============================================================================
 * 
 * This file handles MongoDB connection setup for the Chouieur Express backend.
 * It provides a centralized way to connect to MongoDB and handle connection events.
 * 
 * DATABASE CONFIGURATION:
 * =======================
 * The MongoDB connection is configured via the MONGO_URI environment variable.
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file or deployment platform.
 * 
 * EXAMPLES:
 * =========
 * Local MongoDB: mongodb://localhost:27017/chouieur-express
 * MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/chouieur-express
 * MongoDB Cloud: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chouieur-express
 */

const mongoose = require('mongoose');

// =============================================================================
// CONNECTION CONFIGURATION
// =============================================================================

// Ensure the MongoDB URI includes the database name
// Support both MONGO_URI and MONGODB_URI for compatibility
let MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/chouieur-express';

// If the URI doesn't include a database name, add it
if (MONGO_URI.includes('mongodb+srv://') && !MONGO_URI.includes('/chouieur-express')) {
  MONGO_URI = MONGO_URI.replace('?', '/chouieur-express?');
  if (!MONGO_URI.includes('?')) {
    MONGO_URI += '/chouieur-express';
  }
}

const connectionOptions = {
  maxPoolSize: 5, // Reduced for serverless
  serverSelectionTimeoutMS: 5000, // Faster timeout for serverless
  socketTimeoutMS: 30000, // Close sockets after 30 seconds
  bufferCommands: true, // Enable mongoose buffering for serverless
  retryWrites: true, // Enable retryable writes
  w: 'majority', // Write concern
  retryReads: true, // Enable retryable reads
  useNewUrlParser: true, // Use new URL parser
  useUnifiedTopology: true, // Use unified topology
};

// =============================================================================
// CONNECTION FUNCTIONS
// =============================================================================

// Cache connection promise to prevent multiple simultaneous connections
let connectionPromise = null;

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    
    // If there's already a connection attempt in progress, wait for it
    if (connectionPromise) {
      return connectionPromise;
    }
    
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MONGO_URI env:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
    console.log('📍 MONGODB_URI env:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('📍 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Create connection promise
    connectionPromise = mongoose.connect(MONGO_URI, connectionOptions);
    
    await connectionPromise;
    
    connectionPromise = null; // Clear the promise after success
    
    console.log('✅ MongoDB connected successfully');
    
    return true;
  } catch (error) {
    connectionPromise = null; // Clear the promise on failure
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectFromMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
}

/**
 * Check MongoDB connection status
 */
function getConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.db?.databaseName || 'unknown'
  };
}

// =============================================================================
// CONNECTION EVENT HANDLERS
// =============================================================================

mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
  console.error('🔴 MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🟢 MongoDB reconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing MongoDB connection...');
  await disconnectFromMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, closing MongoDB connection...');
  await disconnectFromMongoDB();
  process.exit(0);
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
  getConnectionStatus,
  mongoose,
  MONGO_URI
};
