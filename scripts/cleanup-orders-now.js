/**
 * =============================================================================
 * MANUAL ORDER CLEANUP SCRIPT
 * =============================================================================
 * 
 * This script manually triggers order cleanup:
 * 1. Archives orders older than 24 hours to Google Sheets
 * 2. Deletes archived orders from MongoDB
 * 
 * Usage: node scripts/cleanup-orders-now.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { cleanupOldOrders } = require('../api/services/order-cleanup-service');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chouieur_express';

async function runCleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Starting manual order cleanup...');
    const result = await cleanupOldOrders();

    console.log('\n📊 Cleanup Results:');
    console.log('===================');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📦 Archived: ${result.archived} orders`);
    console.log(`🗑️  Deleted: ${result.deleted} orders`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);

    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }

    if (result.message) {
      console.log(`ℹ️  Message: ${result.message}`);
    }

    console.log('\n✅ Cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runCleanup();

