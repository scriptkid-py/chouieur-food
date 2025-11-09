/**
 * =============================================================================
 * DIRECT ORDER CLEANUP SCRIPT
 * =============================================================================
 * 
 * Run this script to clean orders NOW:
 * node cleanup-orders-direct.js
 * 
 * This connects directly to MongoDB and cleans orders older than 24 hours.
 */

require('dotenv').config({ path: './api/.env' });
const mongoose = require('mongoose');
const Order = require('./api/models/Order');
const { archiveOrdersToSheets, getOldOrdersDate, ARCHIVE_HOURS } = require('./api/services/order-archive-service');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chouieur_express';

async function cleanupOrdersNow() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const cutoffDate = getOldOrdersDate(ARCHIVE_HOURS);
    console.log(`📅 Looking for orders older than ${ARCHIVE_HOURS} hours`);
    console.log(`⏰ Cutoff date: ${cutoffDate.toISOString()}\n`);

    // Find orders older than 24 hours
    const oldOrders = await Order.find({
      createdAt: { $lt: cutoffDate }
    }).sort({ createdAt: 1 }).lean();

    if (oldOrders.length === 0) {
      console.log('✅ No old orders to clean up!');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`📦 Found ${oldOrders.length} orders to archive\n`);

    // Archive to Google Sheets
    let archivedCount = 0;
    try {
      console.log('📊 Archiving to Google Sheets...');
      const archiveResult = await archiveOrdersToSheets(oldOrders);
      archivedCount = archiveResult.count;
      console.log(`✅ Successfully archived ${archivedCount} orders to Google Sheets\n`);
    } catch (archiveError) {
      console.error('❌ Failed to archive orders:', archiveError.message);
      console.log('⚠️  Orders will NOT be deleted because archiving failed (safety first!)\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Delete archived orders from MongoDB
    console.log('🗑️  Deleting archived orders from MongoDB...');
    const deleteResult = await Order.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    const deletedCount = deleteResult.deletedCount;
    console.log(`✅ Deleted ${deletedCount} orders from MongoDB\n`);

    console.log('📊 Summary:');
    console.log('===========');
    console.log(`📦 Archived: ${archivedCount} orders`);
    console.log(`🗑️  Deleted: ${deletedCount} orders`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}\n`);

    console.log('✅ Cleanup completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupOrdersNow();

