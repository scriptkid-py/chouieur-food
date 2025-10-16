#!/usr/bin/env node

const { google } = require('googleapis');

console.log('🔑 GOOGLE SHEETS API KEY TEST');
console.log('=============================');

const googleSheetsId = '13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk';

// Method 1: Try with API Key (easier to set up)
async function testWithApiKey() {
  console.log('\n🔑 METHOD 1: API KEY APPROACH');
  console.log('This is often easier than service account setup.');
  
  console.log('\n📋 TO GET AN API KEY:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Select project: chouieur-express-sheets');
  console.log('3. Go to: APIs & Services → Credentials');
  console.log('4. Click: Create Credentials → API Key');
  console.log('5. Copy the generated API key');
  console.log('6. (Optional) Restrict the key to Google Sheets API');
  
  console.log('\n📋 TO TEST WITH API KEY:');
  console.log('Run: GOOGLE_API_KEY=your_key_here node test-with-api-key.js');
  
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.log('\n⚠️  No API key provided. Please get one from Google Cloud Console.');
    return false;
  }
  
  try {
    console.log('\n🔌 Testing with API Key...');
    
    const sheets = google.sheets({ version: 'v4' });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: googleSheetsId,
      key: apiKey,
    });
    
    console.log('✅ SUCCESS! API Key method works!');
    console.log(`📊 Spreadsheet: "${response.data.properties.title}"`);
    
    // List sheets
    const sheetsList = response.data.sheets;
    console.log('\n📋 Available sheets:');
    sheetsList.forEach((sheet, index) => {
      console.log(`   ${index + 1}. ${sheet.properties.title}`);
    });
    
    // Try to read some data
    if (sheetsList.length > 0) {
      const firstSheet = sheetsList[0].properties.title;
      console.log(`\n🔍 Reading from "${firstSheet}"...`);
      
      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: googleSheetsId,
        range: `${firstSheet}!A1:E3`,
        key: apiKey,
      });
      
      const values = dataResponse.data.values;
      if (values && values.length > 0) {
        console.log('✅ Data access successful!');
        console.log('📊 Sample data:');
        values.forEach((row, index) => {
          console.log(`   Row ${index + 1}: [${row.join(', ')}]`);
        });
      } else {
        console.log('⚠️  Sheet appears to be empty');
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ API Key method failed:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n🔧 Fix: Your API key is invalid or restricted');
      console.log('   - Check if you copied the key correctly');
      console.log('   - Make sure the key is not restricted to wrong APIs');
    } else if (error.message.includes('not found')) {
      console.log('\n🔧 Fix: Spreadsheet not found');
      console.log('   - Verify the Google Sheets ID is correct');
      console.log('   - Make sure the sheet exists and is accessible');
    }
    
    return false;
  }
}

// Method 2: Alternative - Create a simple test sheet
async function createTestSheet() {
  console.log('\n📝 ALTERNATIVE: CREATE A NEW TEST SHEET');
  console.log('If the current sheet has issues, create a new one:');
  console.log('1. Go to: https://sheets.google.com/');
  console.log('2. Create a new spreadsheet');
  console.log('3. Add some test data (headers in row 1)');
  console.log('4. Share it with your service account');
  console.log('5. Update the GOOGLE_SHEETS_ID in your code');
}

// Run the test
async function main() {
  const success = await testWithApiKey();
  
  if (!success) {
    await createTestSheet();
  }
  
  console.log('\n🎯 NEXT STEPS:');
  if (success) {
    console.log('✅ Google Sheets connection is working!');
    console.log('📝 You can now integrate this into your backend');
    console.log('📝 Use the API key method for simplicity');
  } else {
    console.log('❌ Connection still failing');
    console.log('📝 Try the API key method (often easier than service accounts)');
    console.log('📝 Or create a new test spreadsheet');
  }
}

main();
