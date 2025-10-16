#!/usr/bin/env node

const { google } = require('googleapis');

console.log('🔍 DETAILED GOOGLE SHEETS DIAGNOSTIC');
console.log('====================================');

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

console.log('\n📋 STEP-BY-STEP VERIFICATION CHECKLIST:');
console.log('=====================================');

console.log('\n1️⃣ CREDENTIALS VERIFICATION:');
console.log(`   ✅ Google Sheets ID: ${googleSheetsId}`);
console.log(`   ✅ Service Account: ${serviceAccountEmail}`);
console.log(`   ✅ Private Key: ${privateKey ? 'Present' : 'Missing'}`);

console.log('\n2️⃣ REQUIRED ACTIONS (Please verify each step):');
console.log('   📝 Go to: https://console.cloud.google.com/');
console.log('   📝 Select project: chouieur-express-sheets');
console.log('   📝 Navigate to: APIs & Services → Library');
console.log('   📝 Search for: "Google Sheets API"');
console.log('   📝 Click: ENABLE (if not already enabled)');
console.log('   📝 Verify: API shows as "Enabled"');

console.log('\n3️⃣ SERVICE ACCOUNT VERIFICATION:');
console.log('   📝 Go to: IAM & Admin → Service Accounts');
console.log('   📝 Find: chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com');
console.log('   📝 Check: Status should be "Active"');
console.log('   📝 Check: Should have "Service Account User" role');

console.log('\n4️⃣ GOOGLE SHEET SHARING:');
console.log('   📝 Open: https://docs.google.com/spreadsheets/d/13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk');
console.log('   📝 Click: Share button (top right)');
console.log('   📝 Add: chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com');
console.log('   📝 Set: Permission to "Editor"');
console.log('   📝 Click: Send');

console.log('\n5️⃣ ALTERNATIVE: TRY WITH API KEY METHOD');
console.log('   📝 Go to: APIs & Services → Credentials');
console.log('   📝 Click: Create Credentials → API Key');
console.log('   📝 Copy the API key');
console.log('   📝 Restrict the API key to Google Sheets API');

async function testWithApiKey() {
  console.log('\n🔑 TESTING WITH API KEY METHOD...');
  
  // You'll need to get an API key from Google Cloud Console
  const apiKey = process.env.GOOGLE_API_KEY || 'YOUR_API_KEY_HERE';
  
  if (apiKey === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  No API key provided. To test with API key:');
    console.log('   1. Get API key from Google Cloud Console');
    console.log('   2. Set GOOGLE_API_KEY environment variable');
    console.log('   3. Run: GOOGLE_API_KEY=your_key node diagnose-google-sheets.js');
    return;
  }
  
  try {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: googleSheetsId,
      key: apiKey,
    });
    
    console.log('✅ API Key method works!');
    console.log(`   Spreadsheet: ${response.data.properties.title}`);
    
  } catch (error) {
    console.log('❌ API Key method failed:', error.message);
  }
}

async function testServiceAccount() {
  console.log('\n🔐 TESTING SERVICE ACCOUNT METHOD...');
  
  try {
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: googleSheetsId,
    });
    
    console.log('✅ Service Account method works!');
    console.log(`   Spreadsheet: ${response.data.properties.title}`);
    
  } catch (error) {
    console.log('❌ Service Account method failed:', error.message);
    
    if (error.message.includes('unregistered callers')) {
      console.log('\n🔧 SPECIFIC FIX NEEDED:');
      console.log('   The error "unregistered callers" means:');
      console.log('   1. Google Sheets API is NOT enabled in your project');
      console.log('   2. OR the service account is not properly configured');
      console.log('   3. OR the service account key has expired');
      
      console.log('\n📋 EXACT STEPS TO FIX:');
      console.log('   1. Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com');
      console.log('   2. Make sure project "chouieur-express-sheets" is selected');
      console.log('   3. Click "ENABLE" if it shows "API not enabled"');
      console.log('   4. Wait 2-3 minutes for the API to be fully enabled');
      console.log('   5. Re-run this test');
    }
  }
}

// Run both tests
async function runDiagnostics() {
  await testServiceAccount();
  await testWithApiKey();
  
  console.log('\n📞 IF STILL FAILING:');
  console.log('   1. Double-check you\'re in the correct Google Cloud project');
  console.log('   2. Try creating a new service account key');
  console.log('   3. Verify the Google Sheet exists and is accessible');
  console.log('   4. Check if there are any billing issues with your Google Cloud project');
}

runDiagnostics();
