/**
 * =============================================================================
 * GOOGLE SHEETS DATABASE CONNECTION
 * =============================================================================
 * 
 * This file handles Google Sheets connection and data operations.
 * It replaces MongoDB with Google Sheets as the database for the application.
 * 
 * CONFIGURATION:
 * ==============
 * The Google Sheets connection is configured via environment variables:
 * - GOOGLE_SHEETS_ID: The ID of your Google Sheet
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_PRIVATE_KEY: Service account private key
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 1. Create a Google Cloud Project
 * 2. Enable Google Sheets API
 * 3. Create a Service Account
 * 4. Download the service account JSON key
 * 5. Share your Google Sheet with the service account email
 * 6. Set environment variables in your .env file
 */

const { google } = require('googleapis');
require('dotenv').config();

// =============================================================================
// CONNECTION STATE MANAGEMENT
// =============================================================================

let sheets = null;
let isConnected = false;

// =============================================================================
// GOOGLE SHEETS CONNECTION FUNCTION
// =============================================================================

/**
 * Connect to Google Sheets using service account authentication
 */
async function connectToGoogleSheets() {
  if (isConnected && sheets) {
    console.log('✅ Google Sheets: Already connected');
    return;
  }

  try {
    console.log('🔄 Google Sheets: Connecting to database...');

    // Get environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      throw new Error('Missing required Google Sheets environment variables');
    }

    // Create JWT client
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Initialize sheets API
    sheets = google.sheets({ version: 'v4', auth });

    // Test connection by getting sheet info
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    isConnected = true;
    console.log('✅ Google Sheets Connected');
    console.log(`📊 Google Sheets: Sheet name: ${response.data.properties.title}`);

  } catch (error) {
    console.error('❌ Google Sheets Connection Error:', error.message);
    console.error('🔧 Troubleshooting steps:');
    console.error('   1. Check your Google Sheets environment variables');
    console.error('   2. Verify service account has access to the sheet');
    console.error('   3. Ensure Google Sheets API is enabled');
    console.error('   4. Check that the sheet ID is correct');
    
    throw error;
  }
}

// =============================================================================
// DATA OPERATIONS
// =============================================================================

/**
 * Get all data from a specific sheet
 */
async function getSheetData(sheetName) {
  if (!isConnected) {
    await connectToGoogleSheets();
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return [];
    }

    // Convert rows to objects using first row as headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error(`Error getting data from sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Append data to a specific sheet
 */
async function appendToSheet(sheetName, data) {
  if (!isConnected) {
    await connectToGoogleSheets();
  }

  try {
    // Convert object to array of values
    const values = [Object.values(data)];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error appending data to sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Update a specific row in a sheet
 */
async function updateSheetRow(sheetName, rowIndex, data) {
  if (!isConnected) {
    await connectToGoogleSheets();
  }

  try {
    const values = [Object.values(data)];

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error updating row in sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Find a row by a specific field value
 */
async function findRowByField(sheetName, fieldName, fieldValue) {
  const data = await getSheetData(sheetName);
  return data.find(row => row[fieldName] === fieldValue);
}

/**
 * Get the next available row number for a sheet
 */
async function getNextRowNumber(sheetName) {
  const data = await getSheetData(sheetName);
  return data.length + 2; // +2 because we have headers and arrays are 0-indexed
}

// =============================================================================
// CONNECTION STATUS FUNCTIONS
// =============================================================================

/**
 * Check if Google Sheets is connected
 */
function isGoogleSheetsConnected() {
  return isConnected && sheets !== null;
}

/**
 * Get Google Sheets connection status
 */
function getGoogleSheetsStatus() {
  return {
    isConnected: isConnected,
    hasSheetsInstance: sheets !== null,
  };
}

/**
 * Test Google Sheets connection
 */
async function testGoogleSheetsConnection() {
  try {
    console.log('🧪 Google Sheets: Testing connection...');
    
    if (!isGoogleSheetsConnected()) {
      await connectToGoogleSheets();
    }
    
    // Test by getting sheet info
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    });
    
    console.log('✅ Google Sheets: Connection test successful');
    console.log(`📊 Sheet: ${response.data.properties.title}`);
    return true;
    
  } catch (error) {
    console.error('❌ Google Sheets: Connection test failed:', error);
    return false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  connectToGoogleSheets,
  isGoogleSheetsConnected,
  getGoogleSheetsStatus,
  testGoogleSheetsConnection,
  getSheetData,
  appendToSheet,
  updateSheetRow,
  findRowByField,
  getNextRowNumber,
};
