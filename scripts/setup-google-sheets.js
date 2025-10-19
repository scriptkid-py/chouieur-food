/**
 * Google Sheets Setup Script
 * This script creates the proper structure in your Google Sheets for the restaurant database
 */

const { google } = require('googleapis');
require('dotenv').config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function setupGoogleSheets() {
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

    console.log('🚀 Setting up Google Sheets database...');

    // 1. Create MenuItems sheet
    console.log('📋 Creating MenuItems sheet...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEETS_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: 'MenuItems',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10
              }
            }
          }
        }]
      }
    });

    // Add headers for MenuItems
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:H1',
      valueInputOption: 'RAW',
      resource: {
        values: [['ID', 'Name', 'Category', 'Price', 'MegaPrice', 'Description', 'ImageId', 'IsActive']]
      }
    });

    // 2. Create Orders sheet
    console.log('📦 Creating Orders sheet...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEETS_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Orders',
              gridProperties: {
                rowCount: 1000,
                columnCount: 15
              }
            }
          }
        }]
      }
    });

    // Add headers for Orders
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1',
      valueInputOption: 'RAW',
      resource: {
        values: [['OrderID', 'UserID', 'CustomerName', 'CustomerPhone', 'CustomerAddress', 'Items', 'Total', 'Status', 'CreatedAt', 'UpdatedAt', 'Email', 'Notes', 'DeliveryTime', 'PaymentMethod', 'OrderType']]
      }
    });

    // 3. Create Users sheet
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

    // 4. Create OrderItems sheet (for detailed order items)
    console.log('🛒 Creating OrderItems sheet...');
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

    // 5. Populate MenuItems with sample data
    console.log('🍕 Adding sample menu items...');
    const sampleMenuItems = [
      ['sandwich-pilon', 'Sandwich Pilon', 'Sandwiches', 350, '', 'A signature sandwich with savory fillings.', 'sandwich-pilon', 'TRUE'],
      ['pizza-fromage', 'Pizza Fromage', 'Pizza', 900, 1000, 'A classic cheese pizza with a rich tomato base.', 'pizza-fromage', 'TRUE'],
      ['tacos-viande', 'Tacos Viande', 'Tacos', 350, '', 'Flavorful meat tacos with fresh toppings.', 'tacos-viande', 'TRUE'],
      ['poulet-marine', 'Poulet Mariné', 'Poulet', 350, '', 'Marinated and grilled chicken, tender and juicy.', 'poulet-marine', 'TRUE'],
      ['hamburger-double-cheese', 'Hamburger Double Cheese', 'Hamburgers', 500, '', 'A hearty double cheeseburger with all the fixings.', 'hamburger-double-cheese', 'TRUE'],
      ['panini-classic', 'Panini Classic', 'Panini / Fajitas', 400, '', 'A classic pressed panini with melted cheese.', 'panini', 'TRUE'],
      ['fajitas-poulet', 'Fajitas Poulet', 'Panini / Fajitas', 600, '', 'Sizzling chicken fajitas with peppers and onions.', 'fajitas', 'TRUE'],
      ['plat-du-jour', 'Plat du Jour', 'Plats', 800, '', 'The special plate of the day.', 'plat', 'TRUE']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A2:H9',
      valueInputOption: 'RAW',
      resource: {
        values: sampleMenuItems
      }
    });

    console.log('✅ Google Sheets database setup completed!');
    console.log('📊 Sheets created:');
    console.log('   - MenuItems: Contains all menu items');
    console.log('   - Orders: Contains all customer orders');
    console.log('   - Users: Contains user information');
    console.log('   - OrderItems: Contains detailed order items');
    console.log('🍕 Sample menu items added successfully!');

  } catch (error) {
    console.error('❌ Error setting up Google Sheets:', error.message);
    console.log('🔧 Make sure:');
    console.log('   1. GOOGLE_SHEETS_ID is set correctly');
    console.log('   2. GOOGLE_SERVICE_ACCOUNT_EMAIL is set correctly');
    console.log('   3. GOOGLE_PRIVATE_KEY is set correctly');
    console.log('   4. The service account has access to the Google Sheet');
    console.log('   5. Google Sheets API is enabled in Google Cloud Console');
  }
}

// Run the setup
setupGoogleSheets();
