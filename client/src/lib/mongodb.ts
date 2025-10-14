/**
 * =============================================================================
# MONGODB CONNECTION CONFIGURATION
 * =============================================================================
 * 
 * This file handles MongoDB connection using Mongoose.
 * It reads the MONGO_URI from environment variables and provides
 * connection management with error handling.
 * 
 * CONFIGURATION:
 * ==============
 * The MongoDB connection is configured via the MONGO_URI environment variable:
 * - For local development: mongodb://localhost:27017/myapp_db
 * - For production: mongodb+srv://username:password@cluster.mongodb.net/myapp_db
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * 1. Update MONGO_URI in your .env file
 * 2. For Render deployment, set MONGO_URI in Render dashboard environment variables
 * 3. Restart your application
 * 
 * FOR RENDER DEPLOYMENT:
 * ======================
 * In production, Render should connect to a remote MongoDB instance (MongoDB Atlas).
 * Update the MONGO_URI environment variable in Render dashboard to point to your
 * production MongoDB instance instead of localhost.
 */

import mongoose from 'mongoose';

// =============================================================================
// CONNECTION STATE MANAGEMENT
// =============================================================================

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
}

let connectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
};

// =============================================================================
// MONGODB CONNECTION FUNCTION
// =============================================================================

/**
 * Connect to MongoDB using Mongoose
 * 
 * TO CHANGE MONGODB LOCATION:
 * Update the MONGO_URI environment variable in your .env file or Render dashboard.
 */
export async function connectToMongoDB(): Promise<void> {
  // Check if already connected
  if (connectionState.isConnected) {
    console.log('✅ MongoDB: Already connected');
    return;
  }

  // Check if already connecting
  if (connectionState.isConnecting) {
    console.log('⏳ MongoDB: Connection in progress...');
    return;
  }

  // Get MongoDB URI from environment variables
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    const error = new Error('MONGO_URI environment variable is not set');
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('📝 Please set MONGO_URI in your .env file');
    console.error('   Example: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db');
    throw error;
  }

  try {
    connectionState.isConnecting = true;
    console.log('🔄 MongoDB: Connecting to database...');
    console.log(`📍 MongoDB: URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      // Connection options for better performance and reliability
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    connectionState.isConnected = true;
    connectionState.isConnecting = false;
    
    console.log('✅ MongoDB: Successfully connected to database');
    console.log(`📊 MongoDB: Database name: ${mongoose.connection.db?.databaseName || 'unknown'}`);

  } catch (error) {
    connectionState.isConnecting = false;
    connectionState.isConnected = false;
    
    console.error('❌ MongoDB Connection Error:', error);
    console.error('🔧 Troubleshooting steps:');
    console.error('   1. Check if MongoDB container is running: docker-compose ps');
    console.error('   2. Verify MONGO_URI in your .env file');
    console.error('   3. Check if port 27017 is accessible');
    console.error('   4. For production, ensure MongoDB Atlas connection string is correct');
    
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
  connectionState.isConnected = false;
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
export function isMongoDBConnected(): boolean {
  return connectionState.isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB connection status
 */
export function getMongoDBStatus(): {
  isConnected: boolean;
  isConnecting: boolean;
  readyState: number;
  readyStateText: string;
} {
  const readyStateMap: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    readyState: mongoose.connection.readyState,
    readyStateText: readyStateMap[mongoose.connection.readyState] || 'unknown',
  };
}

// =============================================================================
// DISCONNECT FUNCTION
// =============================================================================

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromMongoDB(): Promise<void> {
  try {
    if (connectionState.isConnected) {
      await mongoose.connection.close();
      connectionState.isConnected = false;
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
export async function testMongoDBConnection(): Promise<boolean> {
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
