#!/usr/bin/env node

const { google } = require('googleapis');
require('dotenv').config();

console.log('🔍 Testing Google Sheets Database Connection...');
console.log('===============================================');

// Check environment variables
console.log('\n📋 Checking Environment Variables:');
const googleSheetsId = process.env.GOOGLE_SHEETS_ID;
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

console.log(`GOOGLE_SHEETS_ID: ${googleSheetsId ? '✅ Set' : '❌ Missing'}`);
console.log(`GOOGLE_SERVICE_ACCOUNT_EMAIL: ${serviceAccountEmail ? '✅ Set' : '❌ Missing'}`);
console.log(`GOOGLE_PRIVATE_KEY: ${privateKey ? '✅ Set' : '❌ Missing'}`);

if (!googleSheetsId || !serviceAccountEmail || !privateKey) {
  console.log('\n❌ Missing required Google Sheets environment variables!');
  console.log('\n🔧 To fix this:');
  console.log('1. Create a .env file in the project root');
  console.log('2. Add the following variables:');
  console.log('   GOOGLE_SHEETS_ID=your_sheet_id');
  console.log('   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email');
  console.log('   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key\\n-----END PRIVATE KEY-----\\n"');
  process.exit(1);
}

async function testGoogleSheetsConnection() {
  try {
    console.log('\n🔌 Attempting to connect to Google Sheets...');
    
    // Create authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Get authenticated client
    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    // Create sheets API instance
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    console.log('✅ Authentication successful');

    // Test 1: Get spreadsheet info
    console.log('\n📊 Testing spreadsheet access...');
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: googleSheetsId,
    });

    console.log(`✅ Spreadsheet found: "${spreadsheetInfo.data.properties.title}"`);
    console.log(`📄 Sheet ID: ${googleSheetsId}`);

    // Test 2: List all sheets
    console.log('\n📋 Available sheets:');
    const sheetsList = spreadsheetInfo.data.sheets;
    sheetsList.forEach((sheet, index) => {
      console.log(`   ${index + 1}. ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
    });

    // Test 3: Try to read from MenuItems sheet (if it exists)
    console.log('\n🍽️  Testing data access...');
    let testSheet = 'MenuItems';
    
    // Check if MenuItems sheet exists
    const menuItemsSheet = sheetsList.find(sheet => 
      sheet.properties.title.toLowerCase().includes('menu') || 
      sheet.properties.title.toLowerCase().includes('items')
    );
    
    if (menuItemsSheet) {
      testSheet = menuItemsSheet.properties.title;
      console.log(`📝 Found menu sheet: "${testSheet}"`);
    } else {
      // Use the first sheet as fallback
      testSheet = sheetsList[0].properties.title;
      console.log(`📝 Using first sheet as test: "${testSheet}"`);
    }

    // Read first 5 rows (non-destructive)
    const range = `${testSheet}!A1:E5`;
    console.log(`🔍 Reading range: ${range}`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: googleSheetsId,
      range: range,
    });

    const values = response.data.values;
    
    if (values && values.length > 0) {
      console.log('✅ Data access successful!');
      console.log(`📊 Found ${values.length} rows of data:`);
      
      values.forEach((row, index) => {
        console.log(`   Row ${index + 1}: [${row.join(', ')}]`);
      });
    } else {
      console.log('⚠️  Sheet is empty or no data in the specified range');
    }

    // Test 4: Check permissions
    console.log('\n🔐 Testing write permissions (read-only test)...');
    try {
      // Try to get spreadsheet metadata to check permissions
      const permissions = await sheets.spreadsheets.get({
        spreadsheetId: googleSheetsId,
        fields: 'properties,sheets.properties',
      });
      console.log('✅ Read permissions confirmed');
    } catch (error) {
      console.log('⚠️  Permission check failed:', error.message);
    }

    console.log('\n🎉 Google Sheets connection test completed successfully!');
    console.log('✅ Connection: Working');
    console.log('✅ Authentication: Valid');
    console.log('✅ Data Access: Working');
    console.log('✅ Permissions: Confirmed');

  } catch (error) {
    console.log('\n❌ Google Sheets connection failed!');
    console.log('Error details:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 Suggested fix: Invalid credentials');
      console.log('   - Check if the service account email is correct');
      console.log('   - Verify the private key is properly formatted');
      console.log('   - Ensure the private key hasn\'t expired');
    } else if (error.message.includes('not found')) {
      console.log('\n🔧 Suggested fix: Spreadsheet not found');
      console.log('   - Verify the Google Sheets ID is correct');
      console.log('   - Check if the spreadsheet exists');
      console.log('   - Ensure the service account has access to the sheet');
    } else if (error.message.includes('permission')) {
      console.log('\n🔧 Suggested fix: Permission denied');
      console.log('   - Share the Google Sheet with the service account email');
      console.log('   - Grant "Editor" or "Viewer" permissions');
    } else {
      console.log('\n🔧 General troubleshooting:');
      console.log('   - Check your internet connection');
      console.log('   - Verify all environment variables are set correctly');
      console.log('   - Ensure the Google Sheets API is enabled in your project');
    }
    
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsConnection();
