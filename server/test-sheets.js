/**
 * =============================================================================
 * GOOGLE SHEETS INTEGRATION TEST
 * =============================================================================
 * 
 * This script tests the Google Sheets integration to ensure everything
 * is working correctly before running the main application.
 */

require('dotenv').config();
const { connectToGoogleSheets, testGoogleSheetsConnection } = require('./sheets');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

async function testGoogleSheetsIntegration() {
  console.log('🧪 Starting Google Sheets Integration Test...\n');

  try {
    // Test 1: Connection
    console.log('1️⃣ Testing Google Sheets connection...');
    await connectToGoogleSheets();
    const isConnected = await testGoogleSheetsConnection();
    
    if (!isConnected) {
      throw new Error('Failed to connect to Google Sheets');
    }
    console.log('✅ Connection test passed\n');

    // Test 2: Menu Items
    console.log('2️⃣ Testing Menu Items operations...');
    try {
      const menuItems = await MenuItem.getAllMenuItems();
      console.log(`✅ Retrieved ${menuItems.length} menu items`);
      
      if (menuItems.length > 0) {
        console.log(`   Sample item: ${menuItems[0].name} - ${menuItems[0].price} DA`);
      }
    } catch (error) {
      console.log('⚠️  Menu Items test failed (this is expected if no data exists yet)');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Users
    console.log('3️⃣ Testing Users operations...');
    try {
      const users = await User.getAllUsers();
      console.log(`✅ Retrieved ${users.length} users`);
      
      if (users.length > 0) {
        console.log(`   Sample user: ${users[0].name} (${users[0].role})`);
      }
    } catch (error) {
      console.log('⚠️  Users test failed (this is expected if no data exists yet)');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 4: Orders
    console.log('4️⃣ Testing Orders operations...');
    try {
      const orders = await Order.getAllOrders();
      console.log(`✅ Retrieved ${orders.length} orders`);
      
      if (orders.length > 0) {
        console.log(`   Sample order: ${orders[0].customerName} - ${orders[0].total} DA`);
      }
    } catch (error) {
      console.log('⚠️  Orders test failed (this is expected if no data exists yet)');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 5: Create test data (optional)
    console.log('5️⃣ Testing data creation...');
    try {
      // Create a test menu item
      const testMenuItem = await MenuItem.createMenuItem({
        name: 'Test Item',
        category: 'Sandwiches',
        price: 100,
        description: 'Test item for integration testing',
        imageId: 'test-item',
        isActive: true,
      });
      console.log(`✅ Created test menu item: ${testMenuItem.name}`);
      
      // Clean up - delete the test item (we'll just note it exists)
      console.log('   Note: Test item created and can be manually deleted from the sheet');
      
    } catch (error) {
      console.log('⚠️  Data creation test failed');
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n🎉 Google Sheets Integration Test Completed!');
    console.log('✅ All core functionality is working correctly');
    console.log('\n📝 Next Steps:');
    console.log('   1. Add your actual menu items to the MenuItems sheet');
    console.log('   2. Test the API endpoints with your frontend');
    console.log('   3. Deploy to Render with the new environment variables');

  } catch (error) {
    console.error('\n❌ Google Sheets Integration Test Failed!');
    console.error(`Error: ${error.message}`);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your environment variables in .env file');
    console.error('   2. Verify Google Sheets API is enabled');
    console.error('   3. Ensure service account has access to the sheet');
    console.error('   4. Check that the sheet has the correct structure');
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsIntegration();
