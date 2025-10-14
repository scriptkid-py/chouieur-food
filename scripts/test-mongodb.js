/**
 * =============================================================================
 * MONGODB CONNECTION TEST SCRIPT
 * =============================================================================
 * 
 * This script tests the MongoDB connection and basic operations.
 * 
 * USAGE:
 * ======
 * node scripts/test-mongodb.js
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  // Display configuration
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI environment variable is not set');
    console.error('📝 Please create a .env file with MONGO_URI=mongodb://localhost:27017/myapp_db');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log('');
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test collection creation and document insertion
    const testCollection = mongoose.connection.db.collection('test');
    const testDoc = { 
      message: 'Hello MongoDB!', 
      timestamp: new Date() 
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Document insertion successful');
    
    // Test document retrieval
    const retrievedDoc = await testCollection.findOne({ message: 'Hello MongoDB!' });
    if (retrievedDoc) {
      console.log('✅ Document retrieval successful');
    }
    
    // Clean up test document
    await testCollection.deleteOne({ message: 'Hello MongoDB!' });
    console.log('✅ Document deletion successful');
    
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('\n❌ MongoDB connection test failed:');
    console.error(`   Error: ${error.message}`);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check if MongoDB container is running: docker-compose ps');
    console.log('   2. Verify MONGO_URI in your .env file');
    console.log('   3. Check if port 27017 is accessible');
    console.log('   4. Try starting MongoDB: docker-compose up -d');
    
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed.');
  }
}

// Run test
testMongoDBConnection().catch(console.error);
