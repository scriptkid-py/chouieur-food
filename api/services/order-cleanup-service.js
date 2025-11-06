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
 * Clean up ALL historical orders (archive to Google Sheets and delete from MongoDB)
 * This is called manually via the admin dashboard button
 */
async function cleanupAllHistoricalOrders() {
  try {
    console.log('🧹 Starting manual cleanup of ALL historical orders...');
    
    // Find ALL orders (no time restriction - clean everything)
    const allOrders = await Order.find({}).sort({ createdAt: 1 });

    if (allOrders.length === 0) {
      console.log('✅ No orders to clean up');
      return { success: true, archived: 0, deleted: 0, message: 'No orders found in database' };
    }

    console.log(`📦 Found ${allOrders.length} orders to archive and clean`);

    // STEP 1: Archive to Google Sheets FIRST (MUST succeed before deletion)
    let archivedCount = 0;
    let archiveSuccess = false;
    
    try {
      console.log(`📤 Archiving ${allOrders.length} orders to Google Sheets...`);
      const archiveResult = await archiveOrdersToSheets(allOrders);
      archivedCount = archiveResult.count || (archiveResult.success ? allOrders.length : 0);
      archiveSuccess = archiveResult.success !== false && archivedCount > 0;
      
      if (!archiveSuccess) {
        throw new Error('Archive result indicates failure or no orders archived');
      }
      
      console.log(`✅ Successfully archived ${archivedCount} orders to Google Sheets (Historical Orders sheet)`);
      console.log(`📋 Backup complete - orders are safely stored in Google Sheets before deletion`);
    } catch (archiveError) {
      console.error('❌ CRITICAL: Failed to archive orders to Google Sheets:', archiveError.message);
      console.error('🛡️  SAFETY: Orders will NOT be deleted because backup failed!');
      // Don't delete orders if archiving fails - safety first!
      return { 
        success: false, 
        error: 'Archive failed', 
        archived: 0, 
        deleted: 0,
        message: 'Orders were NOT deleted because archiving to Google Sheets failed. Please check Google Sheets configuration and try again.'
      };
    }

    // STEP 2: Only delete orders if archiving succeeded (safety check)
    if (!archiveSuccess) {
      console.error('🛡️  SAFETY CHECK FAILED: Archive success flag is false - aborting deletion');
      return {
        success: false,
        error: 'Archive verification failed',
        archived: archivedCount,
        deleted: 0,
        message: 'Orders were NOT deleted because archive verification failed'
      };
    }

    // STEP 3: Delete from MongoDB only after successful backup
    console.log(`🗑️  Deleting ${allOrders.length} orders from MongoDB (backup confirmed in Google Sheets)...`);
    const deleteResult = await Order.deleteMany({});

    const deletedCount = deleteResult.deletedCount;
    
    if (deletedCount !== allOrders.length) {
      console.warn(`⚠️  Warning: Expected to delete ${allOrders.length} orders, but deleted ${deletedCount}`);
    } else {
      console.log(`✅ Successfully deleted ${deletedCount} orders from MongoDB`);
    }
    
    console.log(`📊 Summary: ${archivedCount} archived → ${deletedCount} deleted`);

    return {
      success: true,
      archived: archivedCount,
      archivedCount: archivedCount, // Alias for API response
      deleted: deletedCount,
      deletedCount: deletedCount, // Alias for API response
      timestamp: new Date().toISOString(),
      message: `Successfully archived ${archivedCount} orders to Google Sheets and deleted ${deletedCount} orders from MongoDB. All historical orders are now in Google Sheets.`
    };
  } catch (error) {
    console.error('❌ Error during order cleanup:', error);
    throw error;
  }
}

/**
 * Clean up old orders (archive to Google Sheets and delete from MongoDB)
 * This is for automatic scheduled cleanup (keeps 24-hour window)
 */
async function cleanupOldOrders() {
  try {
    console.log('🧹 Starting automatic order cleanup process...');
    
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

    // STEP 1: Archive to Google Sheets FIRST (MUST succeed before deletion)
    let archivedCount = 0;
    let archiveSuccess = false;
    
    try {
      console.log(`📤 Archiving ${oldOrders.length} orders to Google Sheets...`);
      const archiveResult = await archiveOrdersToSheets(oldOrders);
      archivedCount = archiveResult.count || (archiveResult.success ? oldOrders.length : 0);
      archiveSuccess = archiveResult.success !== false && archivedCount > 0;
      
      if (!archiveSuccess) {
        throw new Error('Archive result indicates failure or no orders archived');
      }
      
      console.log(`✅ Successfully archived ${archivedCount} orders to Google Sheets (Historical Orders sheet)`);
      console.log(`📋 Backup complete - orders are safely stored in Google Sheets before deletion`);
    } catch (archiveError) {
      console.error('❌ CRITICAL: Failed to archive orders to Google Sheets:', archiveError.message);
      console.error('🛡️  SAFETY: Orders will NOT be deleted because backup failed!');
      // Don't delete orders if archiving fails - safety first!
      return { 
        success: false, 
        error: 'Archive failed', 
        archived: 0, 
        deleted: 0,
        message: 'Orders were NOT deleted because archiving to Google Sheets failed. Please check Google Sheets configuration and try again.'
      };
    }

    // STEP 2: Only delete orders if archiving succeeded (safety check)
    if (!archiveSuccess) {
      console.error('🛡️  SAFETY CHECK FAILED: Archive success flag is false - aborting deletion');
      return {
        success: false,
        error: 'Archive verification failed',
        archived: archivedCount,
        deleted: 0,
        message: 'Orders were NOT deleted because archive verification failed'
      };
    }

    // STEP 3: Delete from MongoDB only after successful backup
    console.log(`🗑️  Deleting ${oldOrders.length} orders from MongoDB (backup confirmed in Google Sheets)...`);
    const deleteResult = await Order.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    const deletedCount = deleteResult.deletedCount;
    
    if (deletedCount !== oldOrders.length) {
      console.warn(`⚠️  Warning: Expected to delete ${oldOrders.length} orders, but deleted ${deletedCount}`);
    } else {
      console.log(`✅ Successfully deleted ${deletedCount} orders from MongoDB`);
    }
    
    console.log(`📊 Summary: ${archivedCount} archived → ${deletedCount} deleted`);

    return {
      success: true,
      archived: archivedCount,
      archivedCount: archivedCount, // Alias for API response
      deleted: deletedCount,
      deletedCount: deletedCount, // Alias for API response
      timestamp: new Date().toISOString(),
      message: `Successfully archived ${archivedCount} orders to Google Sheets and deleted ${deletedCount} orders from MongoDB`
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
  cleanupAllHistoricalOrders,
  getRecentOrders,
  getOldOrdersDate,
  ARCHIVE_HOURS
};

