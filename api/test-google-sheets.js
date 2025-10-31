/**
 * Test Google Sheets Connection
 * Run this to verify your Google Sheets setup is correct
 */

require('dotenv').config();
const { initGoogleSheets, listMenuItems, createMenuItem, sheetsClient } = require('./services/google-sheets-service');

async function testConnection() {
  console.log('🔍 Testing Google Sheets Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('   GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ Set' : '❌ Missing');
  console.log('   GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
  console.log('   GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ Missing required environment variables!');
    process.exit(1);
  }

  // Initialize Google Sheets
  console.log('🔌 Initializing Google Sheets client...');
  const client = await initGoogleSheets();
  
  if (!client) {
    console.error('❌ Failed to initialize Google Sheets client');
    console.error('   Check your credentials and ensure the service account has access to the sheet');
    process.exit(1);
  }

  console.log('✅ Google Sheets client initialized\n');

  // Test reading from sheet
  console.log('📖 Testing read access...');
  try {
    const items = await listMenuItems();
    if (items === null) {
      console.error('❌ Failed to read from Google Sheet');
      console.error('   Check:');
      console.error('   1. Sheet ID is correct');
      console.error('   2. Sheet is shared with service account email');
      console.error('   3. Sheet tab is named "MenuItems"');
      process.exit(1);
    }
    console.log(`✅ Successfully read ${items.length} menu items from Google Sheet`);
    if (items.length > 0) {
      console.log('\n📝 Sample item:');
      console.log(JSON.stringify(items[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error reading from sheet:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify Sheet ID is correct');
    console.error('   2. Share sheet with:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.error('   3. Give Editor permission');
    console.error('   4. Check sheet tab name is "MenuItems"');
    process.exit(1);
  }

  // Test write access (optional - comment out if you don't want to create test data)
  console.log('\n📝 Testing write access...');
  try {
    const testItem = {
      id: `test-${Date.now()}`,
      name: 'Test Item - DELETE ME',
      category: 'Test',
      price: 0.01,
      description: 'This is a test item - you can delete it',
      imageUrl: '',
      isActive: false // Set to false so it doesn't show on menu
    };

    const created = await createMenuItem(testItem);
    if (created) {
      console.log('✅ Successfully wrote test item to Google Sheet');
      console.log('   Test item ID:', testItem.id);
      console.log('   You can delete this item from your Google Sheet');
    } else {
      console.log('⚠️  Write test failed (this might be OK if sheet structure is different)');
    }
  } catch (error) {
    console.error('❌ Error writing to sheet:', error.message);
    console.error('   This might indicate permission issues');
  }

  console.log('\n✅ All tests passed! Your Google Sheets integration is working!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Set these environment variables in Vercel');
  console.log('   2. Deploy to Vercel');
  console.log('   3. Test the API endpoints');
}

// Run test
testConnection().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

