/**
 * =============================================================================
 * MONGODB ATLAS CONNECTION TEST
 * =============================================================================
 * 
 * This script tests the MongoDB Atlas connection using your configured URI.
 * 
 * USAGE:
 * ======
 * node test-atlas-connection.js
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  // Display configuration
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI environment variable is not set');
    console.error('📝 Please create a .env file with your MongoDB Atlas connection string');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log('');
  
  try {
    // Connect to MongoDB Atlas
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test collection creation and document insertion
    const testCollection = mongoose.connection.db.collection('test');
    const testDoc = { 
      message: 'Hello MongoDB Atlas!', 
      timestamp: new Date(),
      testId: Math.random().toString(36).substring(7)
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Document insertion successful');
    
    // Test document retrieval
    const retrievedDoc = await testCollection.findOne({ testId: testDoc.testId });
    if (retrievedDoc) {
      console.log('✅ Document retrieval successful');
    }
    
    // Clean up test document
    await testCollection.deleteOne({ testId: testDoc.testId });
    console.log('✅ Document deletion successful');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas is working correctly.');
    console.log('🚀 Your application is ready for Render deployment!');
    
  } catch (error) {
    console.error('\n❌ MongoDB Atlas connection test failed:');
    console.error(`   Error: ${error.message}`);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check your MONGO_URI in .env file');
    console.log('   2. Verify MongoDB Atlas cluster is running');
    console.log('   3. Check network connectivity');
    console.log('   4. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('   5. Verify database user permissions');
    
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed.');
  }
}

// Run test
testAtlasConnection().catch(console.error);
