/**
 * =============================================================================
 * ORDER CLEANUP SERVICE
 * =============================================================================
 * 
 * This service runs every 24 hours to:
 * 1. Archive orders older than 24 hours to Google Sheets
 * 2. Delete archived orders from MongoDB
 * 
 * Usage:
 * - Call cleanupOldOrders() to run the cleanup manually
 * - Set up a cron job to call this every 24 hours
 */

const Order = require('../models/Order');
const { archiveOrdersToSheets, getOldOrdersDate, ARCHIVE_HOURS } = require('./order-archive-service');

/**
 * Clean up old orders (archive to Google Sheets and delete from MongoDB)
 */
async function cleanupOldOrders() {
  try {
    console.log('🧹 Starting order cleanup process...');
    
    const cutoffDate = getOldOrdersDate(ARCHIVE_HOURS);
    console.log(`📅 Archiving orders older than ${ARCHIVE_HOURS} hours (before ${cutoffDate.toISOString()})`);

    // Find orders older than 24 hours
    const oldOrders = await Order.find({
      createdAt: { $lt: cutoffDate }
    }).sort({ createdAt: 1 });

    if (oldOrders.length === 0) {
      console.log('✅ No old orders to clean up');
      return { success: true, archived: 0, deleted: 0 };
    }

    console.log(`📦 Found ${oldOrders.length} orders to archive`);

    // Archive to Google Sheets (MUST succeed before deletion)
    let archivedCount = 0;
    try {
      const archiveResult = await archiveOrdersToSheets(oldOrders);
      archivedCount = archiveResult.count;
      console.log(`✅ Successfully archived ${archivedCount} orders to Google Sheets`);
    } catch (archiveError) {
      console.error('❌ Failed to archive orders to Google Sheets:', archiveError.message);
      // Don't delete orders if archiving fails - safety first!
      return { 
        success: false, 
        error: 'Archive failed', 
        archived: 0, 
        deleted: 0,
        message: 'Orders were not deleted because archiving failed. Please check Google Sheets configuration.'
      };
    }

    // Only delete orders if archiving succeeded
    const deleteResult = await Order.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    const deletedCount = deleteResult.deletedCount;
    console.log(`🗑️  Deleted ${deletedCount} orders from MongoDB`);

    return {
      success: true,
      archived: archivedCount,
      deleted: deletedCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error during order cleanup:', error);
    throw error;
  }
}

/**
 * Get orders from the last 24 hours only
 */
async function getRecentOrders(query = {}, options = {}) {
  const cutoffDate = getOldOrdersDate(ARCHIVE_HOURS);
  
  const recentQuery = {
    ...query,
    createdAt: { $gte: cutoffDate }
  };

  const { limit = 1000, skip = 0, sort = { createdAt: -1 } } = options;

  const orders = await Order.find(recentQuery)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalCount = await Order.countDocuments(recentQuery);

  return {
    orders,
    totalCount,
    cutoffDate: cutoffDate.toISOString()
  };
}

module.exports = {
  cleanupOldOrders,
  getRecentOrders,
  getOldOrdersDate,
  ARCHIVE_HOURS
};

