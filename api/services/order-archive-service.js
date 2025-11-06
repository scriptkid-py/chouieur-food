/**
 * =============================================================================
 * ORDER ARCHIVE SERVICE
 * =============================================================================
 * 
 * This service handles archiving historical orders to Google Sheets
 * and cleaning old orders from the database every 24 hours.
 * 
 * Features:
 * - Archive orders older than 24 hours to Google Sheets
 * - Delete archived orders from MongoDB/Firestore
 * - Maintain historical records in Google Sheets
 */

const { google } = require('googleapis');
require('dotenv').config();

// Configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const ARCHIVE_SHEET_NAME = 'Historical Orders';
const ARCHIVE_HOURS = 24; // Archive orders older than 24 hours

let sheetsClient = null;

/**
 * Initialize Google Sheets client
 */
async function initGoogleSheets() {
  try {
    if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.warn('⚠️  Google Sheets credentials not configured for archiving');
      return null;
    }

    const cleanPrivateKey = GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .trim();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: cleanPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets client initialized for archiving');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets for archiving:', error.message);
    return null;
  }
}

/**
 * Ensure the Historical Orders sheet exists
 */
async function ensureArchiveSheet(sheets) {
  try {
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
    });

    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === ARCHIVE_SHEET_NAME
    );

    if (!sheetExists) {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: ARCHIVE_SHEET_NAME,
                },
              },
            },
          ],
        },
      });

      // Add headers
      const headers = [
        'Order ID',
        'Customer Name',
        'Customer Phone',
        'Customer Address',
        'Items (JSON)',
        'Total',
        'Status',
        'Order Type',
        'Payment Method',
        'Created At',
        'Updated At',
        'Delivered At',
        'Assigned Driver',
        'Assigned Driver ID',
        'Notes',
        'Archived At'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `${ARCHIVE_SHEET_NAME}!A1:P1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });

      // Format header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: spreadsheet.data.sheets.find(s => s.properties.title === ARCHIVE_SHEET_NAME)?.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
          ],
        },
      });

      console.log(`✅ Created "${ARCHIVE_SHEET_NAME}" sheet with headers`);
    }
  } catch (error) {
    console.error('❌ Error ensuring archive sheet:', error.message);
    throw error;
  }
}

/**
 * Format order items for Google Sheets
 */
function formatOrderItems(items) {
  if (!items || !Array.isArray(items)) return '';
  return JSON.stringify(items);
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
    const sheets = await initGoogleSheets();
    if (!sheets) {
      throw new Error('Google Sheets not available for archiving');
    }

    // Ensure archive sheet exists
    await ensureArchiveSheet(sheets);

    // Format orders for Google Sheets
    const rows = orders.map(order => [
      order.orderId || order.orderid || order.id || '',
      order.customerName || 'Anonymous',
      order.customerPhone || '',
      order.customerAddress || '',
      formatOrderItems(order.items),
      order.total || 0,
      order.status || 'unknown',
      order.orderType || 'delivery',
      order.paymentMethod || 'cash',
      order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
      order.deliveredAt ? new Date(order.deliveredAt).toISOString() : '',
      order.assignedDriver || '',
      order.assignedDriverId || '',
      order.notes || '',
      new Date().toISOString() // Archived timestamp
    ]);

    // Append to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${ARCHIVE_SHEET_NAME}!A:P`,
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
 * Get orders older than specified hours
 */
function getOldOrdersDate(hours = ARCHIVE_HOURS) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

module.exports = {
  initGoogleSheets,
  archiveOrdersToSheets,
  getOldOrdersDate,
  ARCHIVE_HOURS,
  ARCHIVE_SHEET_NAME
};

