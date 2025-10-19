/**
 * Update Menu Schema Script
 * This script updates the existing MenuItems sheet to include the new ImageUrl column
 */

const { google } = require('googleapis');
require('dotenv').config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function updateMenuSchema() {
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

    console.log('🔍 Checking current MenuItems sheet structure...');

    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:H100',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      console.log('❌ No data found in MenuItems sheet');
      return;
    }

    const headers = values[0];
    console.log('📊 Current headers:', headers);

    // Check if ImageUrl column already exists
    if (headers.includes('ImageUrl')) {
      console.log('✅ ImageUrl column already exists');
      return;
    }

    console.log('📝 Adding ImageUrl column...');

    // Add ImageUrl column header
    const newHeaders = [...headers, 'ImageUrl'];
    
    // Update headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:I1',
      valueInputOption: 'RAW',
      resource: {
        values: [newHeaders]
      }
    });

    // Add empty ImageUrl values for existing rows
    if (values.length > 1) {
      const dataRows = values.slice(1);
      const updatedRows = dataRows.map(row => [...row, '']); // Add empty ImageUrl column

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `MenuItems!A2:I${values.length}`,
        valueInputOption: 'RAW',
        resource: {
          values: updatedRows
        }
      });
    }

    console.log('✅ MenuItems sheet updated successfully!');
    console.log('📊 New structure:');
    console.log('   - ID, Name, Category, Price, MegaPrice, Description, ImageId, ImageUrl, IsActive');

  } catch (error) {
    console.error('❌ Error updating MenuItems schema:', error.message);
  }
}

// Run the script
updateMenuSchema();
