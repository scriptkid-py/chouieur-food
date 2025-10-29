/**
 * =============================================================================
 * MONGODB TO GOOGLE SHEETS ARCHIVE SERVICE
 * =============================================================================
 * 
 * This service automatically archives old orders from MongoDB to Google Sheets
 * when the database reaches a certain threshold (number of orders).
 * 
 * Features:
 * - Monitors MongoDB order count
 * - Archives old delivered/cancelled orders to Google Sheets
 * - Keeps recent orders in MongoDB for fast access
 * - Prevents database from filling up
 */

const { google } = require('googleapis');
const Order = require('../models/Order');

// =============================================================================
// CONFIGURATION
// =============================================================================

const ARCHIVE_THRESHOLD = 1000; // Archive when MongoDB has more than 1000 orders
const KEEP_RECENT_ORDERS = 100; // Keep the 100 most recent orders in MongoDB
const ARCHIVE_STATUSES = ['delivered', 'cancelled']; // Only archive completed orders

// Google Sheets Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1L2p1U5l4ijS_f7J4y1J5BQj7KZoXi8mLZbwKKBzjlx4';
const ARCHIVE_SHEET_NAME = 'Archived Orders';

// =============================================================================
// GOOGLE SHEETS AUTHENTICATION
// =============================================================================

async function getGoogleSheetsClient() {
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS_BASE64 || '', 'base64').toString()
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('❌ Failed to authenticate with Google Sheets:', error.message);
    return null;
  }
}

// =============================================================================
// ARCHIVE FUNCTIONS
// =============================================================================

/**
 * Check if MongoDB needs archiving
 */
async function needsArchiving() {
  try {
    const totalOrders = await Order.countDocuments();
    console.log(`📊 MongoDB has ${totalOrders} orders (threshold: ${ARCHIVE_THRESHOLD})`);
    return totalOrders > ARCHIVE_THRESHOLD;
  } catch (error) {
    console.error('❌ Error checking order count:', error);
    return false;
  }
}

/**
 * Get old orders to archive
 */
async function getOrdersToArchive() {
  try {
    // Get all completed orders except the most recent ones
    const allCompletedOrders = await Order.find({
      status: { $in: ARCHIVE_STATUSES }
    }).sort({ createdAt: -1 });

    // Archive all but the most recent KEEP_RECENT_ORDERS
    const ordersToArchive = allCompletedOrders.slice(KEEP_RECENT_ORDERS);
    
    console.log(`📦 Found ${ordersToArchive.length} orders to archive`);
    return ordersToArchive;
  } catch (error) {
    console.error('❌ Error getting orders to archive:', error);
    return [];
  }
}

/**
 * Ensure archive sheet exists with headers
 */
async function ensureArchiveSheet(sheets) {
  try {
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === ARCHIVE_SHEET_NAME
    );

    if (!sheetExists) {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: ARCHIVE_SHEET_NAME,
              },
            },
          }],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ARCHIVE_SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            'Order ID',
            'Customer Name',
            'Customer Phone',
            'Customer Address',
            'Items',
            'Total',
            'Status',
            'Created At',
            'Updated At',
            'Order Type',
            'Payment Method',
            'Archived At'
          ]],
        },
      });

      console.log('✅ Created archive sheet with headers');
    }

    return true;
  } catch (error) {
    console.error('❌ Error ensuring archive sheet:', error);
    return false;
  }
}

/**
 * Format order items for Google Sheets
 */
function formatOrderItems(items) {
  if (!items || items.length === 0) return 'No items';
  
  return items.map(item => {
    const name = item.name || 'Unknown Item';
    const quantity = item.quantity || 1;
    const size = item.size || 'regular';
    return `${quantity}x ${name} (${size})`;
  }).join('; ');
}

/**
 * Archive orders to Google Sheets
 */
async function archiveOrdersToSheets(orders) {
  if (orders.length === 0) {
    console.log('✅ No orders to archive');
    return { success: true, count: 0 };
  }

  try {
    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      throw new Error('Failed to connect to Google Sheets');
    }

    // Ensure archive sheet exists
    await ensureArchiveSheet(sheets);

    // Format orders for Google Sheets
    const rows = orders.map(order => [
      order.orderId || order._id.toString(),
      order.customerName || 'Anonymous',
      order.customerPhone || '',
      order.customerAddress || '',
      formatOrderItems(order.items),
      order.total || 0,
      order.status || 'unknown',
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
      order.updatedAt ? new Date(order.updatedAt).toISOString() : '',
      order.orderType || 'delivery',
      order.paymentMethod || 'cash',
      new Date().toISOString() // Archived timestamp
    ]);

    // Append to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ARCHIVE_SHEET_NAME}!A:L`,
      valueInputOption: 'RAW',
      resource: {
        values: rows,
      },
    });

    console.log(`✅ Archived ${orders.length} orders to Google Sheets`);
    return { success: true, count: orders.length };
  } catch (error) {
    console.error('❌ Error archiving to Google Sheets:', error);
    throw error;
  }
}

/**
 * Delete archived orders from MongoDB
 */
async function deleteArchivedOrders(orderIds) {
  try {
    const result = await Order.deleteMany({
      _id: { $in: orderIds }
    });

    console.log(`🗑️ Deleted ${result.deletedCount} orders from MongoDB`);
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('❌ Error deleting orders:', error);
    throw error;
  }
}

/**
 * Main archive function - archives old orders to Google Sheets and deletes from MongoDB
 */
async function archiveOldOrders() {
  console.log('🔄 Starting archive process...');

  try {
    // Check if archiving is needed
    const shouldArchive = await needsArchiving();
    if (!shouldArchive) {
      console.log('✅ No archiving needed - database below threshold');
      return {
        success: true,
        archived: 0,
        deleted: 0,
        message: 'No archiving needed'
      };
    }

    // Get orders to archive
    const ordersToArchive = await getOrdersToArchive();
    if (ordersToArchive.length === 0) {
      console.log('✅ No completed orders to archive');
      return {
        success: true,
        archived: 0,
        deleted: 0,
        message: 'No orders to archive'
      };
    }

    // Archive to Google Sheets
    const archiveResult = await archiveOrdersToSheets(ordersToArchive);
    
    // Delete from MongoDB
    const orderIds = ordersToArchive.map(order => order._id);
    const deleteResult = await deleteArchivedOrders(orderIds);

    console.log('✅ Archive process completed successfully');
    return {
      success: true,
      archived: archiveResult.count,
      deleted: deleteResult.deletedCount,
      message: `Archived ${archiveResult.count} orders to Google Sheets and deleted from MongoDB`
    };
  } catch (error) {
    console.error('❌ Archive process failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Archive process failed'
    };
  }
}

/**
 * Check and archive if needed (can be called after creating new orders)
 */
async function checkAndArchive() {
  try {
    const shouldArchive = await needsArchiving();
    if (shouldArchive) {
      console.log('📢 Database threshold reached - starting automatic archive...');
      return await archiveOldOrders();
    }
    return { success: true, archived: 0, message: 'No archiving needed' };
  } catch (error) {
    console.error('❌ Check and archive failed:', error);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  archiveOldOrders,
  checkAndArchive,
  needsArchiving,
  ARCHIVE_THRESHOLD,
  KEEP_RECENT_ORDERS
};

