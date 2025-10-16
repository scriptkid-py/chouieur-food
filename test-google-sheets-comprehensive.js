#!/usr/bin/env node

const { google } = require('googleapis');

console.log('🔍 Comprehensive Google Sheets Database Connection Test');
console.log('======================================================');

// Google Sheets credentials
const googleSheetsId = '13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk';
const serviceAccountEmail = 'chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com';
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCHoQYJ0nK7mFFZ
omz6vLAKAHRqCcF4fOo/G8WOecrgd5uxl7g1k9y1c19lGKPBgOz2pIHSLpqCiTVO
ZkQBAEUmJWwF8HfWvU2Il3fA23VcP9XTWdRSaW4BQk9IaVTKrMbebyVV33wxZFtF
9dLf0jZtXom25gNuVeWmctOa6k5W5eSCa1PIaOZNYmkNzXVH5dSIJLacwhUlJNyv
9QUzHiX6uGEozmJYpGRduwhQNxXBr3YW5ZKXn9fb5D8CTHo2dZORdeASYDJ818nA
epAbJmG+bDlo7RpDCqg4W5srZSpjSHE/rT4Bsr0wet8X1hPehDom2dTt7UFB72e/
CSdtLnbZAgMBAAECggIACOnRLsYQ2jlJZ12gUd4ip5WeEPXxLAzxjBBI0KofgiF3z
8njpF0RPZfFeHJPA90+UwyTOj1SWvOttgGiCIZq18KrW7ZD/HzKzrL1flmIV1Wkw
kUI/DOd23khQU47wjp1KOIYPaxRT4h8ZTIC6ShFTmF51KHr3UMH+ZLD5LR4m5dj/
bI8027B8eGl6C/S62rKJL9k1fCfLIeqL1qRcpqhr2+VhLikqcHNH2bazpUVer6mn
Qzi2ME8HUoAM8+Q6syv/y77nVqAyXDJVuvHdqQXMB9hzzsqan8RA2Rjgz7NK5N8P
q6DfX3pJm5VoULKLvgv+BNwIAlRhtTKcmHeg5BUs3QKBgQC65IWydG2vUFqDkFpS
+mL963I4JbjAdoZR2Sptc5lazg5U4QPY6px2qLGTBU3Bw4hm04LHaxzC2BXaw5K2
8rLg6L3t5cETc/U1qwD2zCkZukqq3sGL7PX6utnTZXgYFPFs+CaMl1lpi73ZvrDI
s22MaxuogMLVBE/Dj8WBEdCDzwKBgQC5x9KlBPeyzdcSCvw1p3oq0CWqTwSeOW0p
8ZYINDEDvZ6hnccNwwtMc65/G/4xhEjD9mpCKvQnxBD+qzB8JuvUhjPtzck0Skj+
o8s7GxKdzn07IjA6FyShSN7tzxLHherOoA6CUdI4Aw9EWK2tkAfBecN4qgHTCMOd
G1bTubD81wKBgA0p22DeYntepYFuwW3mxOItmzXpMkIcFwncyeg7pCmJKelAkAzP
OYYCC7/XN8rWAt17OFLjcHsozSFDdSn9nivJONdwv1CncjX1fWvkpWByhp/SYL+C
STEHx/LPys2na/nI4K42Ws3cVBvqGnmIacbiJGiR6ScnzpZvofGdV5pxAoGATbbo
R/2e/F4dBMAxpuQrN7OgvfCWFvYg0zXrM/1ZL55nuGW++ePIWy/dI/AkpGQY6Fix
NIKxZd0f2tiTzKufZWTKXkUCUOxuQo8UGeKGVBsnyc/Qasx5lzpbfxFrYqmDgvHz
f9JoZOPqxAVwibVBeU7NVTGQ183HvnXMSX9ZKTsCgYBDvyqgMAqPRGSAmYQ1T5ZJ
NeUvu0QhxorZ0xV3X7AvEKAnoa4Z2jFnvq1tZMXr0bpDHEzqNK/f6um78TwP7z7h
T7aFKSYT/2aYFgvSdXxPVoCHj33NApnYPHVD7NGltvMCQbO34aA3qyWEJoHDQKSs
dk5yvqVdqBoJ7hZg7HMe3w==
-----END PRIVATE KEY-----`;

console.log('\n📋 Configuration:');
console.log(`GOOGLE_SHEETS_ID: ${googleSheetsId}`);
console.log(`SERVICE_ACCOUNT_EMAIL: ${serviceAccountEmail}`);
console.log(`PRIVATE_KEY: ${privateKey ? '✅ Set' : '❌ Missing'}`);

async function testGoogleSheetsConnection() {
  try {
    console.log('\n🔌 Step 1: Testing Authentication...');
    
    // Create JWT client
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    console.log('✅ JWT client created successfully');

    // Test 2: Try to access the spreadsheet
    console.log('\n📊 Step 2: Testing Spreadsheet Access...');
    const sheets = google.sheets({ version: 'v4', auth });

    try {
      const spreadsheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: googleSheetsId,
      });

      console.log(`✅ Spreadsheet found: "${spreadsheetInfo.data.properties.title}"`);
      console.log(`📄 Sheet ID: ${googleSheetsId}`);

      // Test 3: List all sheets
      console.log('\n📋 Step 3: Listing Available Sheets...');
      const sheetsList = spreadsheetInfo.data.sheets;
      sheetsList.forEach((sheet, index) => {
        console.log(`   ${index + 1}. ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
      });

      // Test 4: Try to read data (non-destructive)
      console.log('\n🍽️  Step 4: Testing Data Access...');
      const testSheet = sheetsList[0].properties.title;
      console.log(`📝 Using sheet: "${testSheet}"`);

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

      console.log('\n🎉 Google Sheets connection test completed successfully!');
      console.log('✅ Connection: Working');
      console.log('✅ Authentication: Valid');
      console.log('✅ Data Access: Working');
      console.log('✅ Permissions: Confirmed');

    } catch (spreadsheetError) {
      console.log('\n❌ Spreadsheet access failed!');
      console.log('Error details:', spreadsheetError.message);
      
      if (spreadsheetError.message.includes('not found')) {
        console.log('\n🔧 Suggested fix: Spreadsheet not found');
        console.log('   - Verify the Google Sheets ID is correct');
        console.log('   - Check if the spreadsheet exists');
        console.log('   - Ensure the service account has access to the sheet');
        console.log('   - Share the Google Sheet with: ' + serviceAccountEmail);
      } else if (spreadsheetError.message.includes('permission')) {
        console.log('\n🔧 Suggested fix: Permission denied');
        console.log('   - Share the Google Sheet with the service account email');
        console.log('   - Grant "Editor" or "Viewer" permissions');
        console.log('   - Service account email: ' + serviceAccountEmail);
      } else if (spreadsheetError.message.includes('unregistered callers')) {
        console.log('\n🔧 Suggested fix: API not enabled or service account not configured');
        console.log('   - Enable Google Sheets API in Google Cloud Console');
        console.log('   - Ensure the service account has proper permissions');
        console.log('   - Check if the service account is active');
      } else {
        console.log('\n🔧 General troubleshooting:');
        console.log('   - Check your internet connection');
        console.log('   - Verify all credentials are correct');
        console.log('   - Ensure the Google Sheets API is enabled in your project');
      }
      
      throw spreadsheetError;
    }

  } catch (error) {
    console.log('\n❌ Google Sheets connection test failed!');
    console.log('Error details:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 Suggested fix: Invalid credentials');
      console.log('   - Check if the service account email is correct');
      console.log('   - Verify the private key is properly formatted');
      console.log('   - Ensure the private key hasn\'t expired');
      console.log('   - Regenerate the service account key if needed');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.log('\n🔧 Suggested fix: Network connectivity issue');
      console.log('   - Check your internet connection');
      console.log('   - Verify firewall settings');
      console.log('   - Try again in a few minutes');
    } else {
      console.log('\n🔧 General troubleshooting:');
      console.log('   - Verify all environment variables are set correctly');
      console.log('   - Ensure the Google Sheets API is enabled in your project');
      console.log('   - Check if the service account is properly configured');
    }
    
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsConnection();
