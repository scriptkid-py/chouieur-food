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
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chouieur-express';

// If the URI doesn't include a database name, add it
if (MONGO_URI.includes('mongodb+srv://') && !MONGO_URI.includes('/chouieur-express')) {
  MONGO_URI = MONGO_URI.replace('?', '/chouieur-express?');
  if (!MONGO_URI.includes('?')) {
    MONGO_URI += '/chouieur-express';
  }
}

const connectionOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  retryWrites: true, // Enable retryable writes
  w: 'majority', // Write concern
  retryReads: true, // Enable retryable reads
};

// =============================================================================
// CONNECTION FUNCTIONS
// =============================================================================

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return true;
    }
    
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(MONGO_URI, connectionOptions);
    
    console.log('✅ MongoDB connected successfully');
    console.log('🗄️  Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔧 Make sure MongoDB is running and MONGO_URI is correct');
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
