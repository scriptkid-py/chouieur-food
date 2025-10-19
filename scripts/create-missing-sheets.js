/**
 * Create Missing Sheets Script
 * This script creates the missing OrderItems sheet in your Google Sheets
 */

const { google } = require('googleapis');
require('dotenv').config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function createMissingSheets() {
  try {
    // Clean the private key
    const cleanPrivateKey = GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .trim();

    // Create GoogleAuth with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: cleanPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create sheets API instance
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('🔍 Checking existing sheets...');

    // Get spreadsheet info to see what sheets exist
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
    });

    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    console.log('📋 Existing sheets:', existingSheets);

    // Create OrderItems sheet if it doesn't exist
    if (!existingSheets.includes('OrderItems')) {
      console.log('📦 Creating OrderItems sheet...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'OrderItems',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            }
          }]
        }
      });

      // Add headers for OrderItems
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'OrderItems!A1:J1',
        valueInputOption: 'RAW',
        resource: {
          values: [['OrderID', 'MenuItemID', 'Name', 'Quantity', 'Size', 'UnitPrice', 'TotalPrice', 'Supplements', 'CreatedAt', 'Notes']]
        }
      });

      console.log('✅ OrderItems sheet created successfully!');
    } else {
      console.log('✅ OrderItems sheet already exists');
    }

    // Create Users sheet if it doesn't exist
    if (!existingSheets.includes('Users')) {
      console.log('👥 Creating Users sheet...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Users',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            }
          }]
        }
      });

      // Add headers for Users
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'Users!A1:F1',
        valueInputOption: 'RAW',
        resource: {
          values: [['UserID', 'Email', 'Name', 'Role', 'CreatedAt', 'LastLogin']]
        }
      });

      console.log('✅ Users sheet created successfully!');
    } else {
      console.log('✅ Users sheet already exists');
    }

    // Update Orders sheet headers if needed
    console.log('📋 Checking Orders sheet headers...');
    const ordersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1',
    });

    const ordersHeaders = ordersResponse.data.values?.[0] || [];
    console.log('📊 Current Orders headers:', ordersHeaders);

    if (ordersHeaders.length < 15) {
      console.log('📝 Updating Orders sheet headers...');
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'Orders!A1:O1',
        valueInputOption: 'RAW',
        resource: {
          values: [['OrderID', 'UserID', 'CustomerName', 'CustomerPhone', 'CustomerAddress', 'Items', 'Total', 'Status', 'CreatedAt', 'UpdatedAt', 'Email', 'Notes', 'DeliveryTime', 'PaymentMethod', 'OrderType']]
        }
      });
      console.log('✅ Orders sheet headers updated!');
    }

    console.log('🎉 All sheets are now properly configured!');

  } catch (error) {
    console.error('❌ Error creating missing sheets:', error.message);
  }
}

// Run the script
createMissingSheets();
