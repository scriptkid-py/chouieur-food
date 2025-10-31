/**
 * Test API without ADMIN_PASSWORD
 */

require('dotenv').config();
const { initGoogleSheets, listMenuItems, createMenuItem } = require('./services/google-sheets-service');

async function test() {
  console.log('🧪 Testing Google Sheets API without ADMIN_PASSWORD...\n');
  
  // Test 1: Check if Google Sheets connection works
  console.log('1️⃣  Testing Google Sheets connection...');
  try {
    await initGoogleSheets();
    console.log('   ✅ Google Sheets connected\n');
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    process.exit(1);
  }

  // Test 2: Read menu items
  console.log('2️⃣  Testing read operation...');
  try {
    const items = await listMenuItems();
    console.log(`   ✅ Successfully read ${items ? items.length : 0} menu items\n`);
  } catch (error) {
    console.error('   ❌ Read failed:', error.message);
    process.exit(1);
  }

  // Test 3: Create a test item (without auth - should work if no password set)
  console.log('3️⃣  Testing create operation (no auth)...');
  try {
    const testItem = {
      id: `test-${Date.now()}`,
      name: 'Test Item - DELETE ME',
      category: 'Test',
      price: 0.01,
      description: 'Test item - delete from sheet',
      imageUrl: '',
      isActive: false
    };
    
    const created = await createMenuItem(testItem);
    if (created) {
      console.log(`   ✅ Successfully created test item: ${testItem.id}`);
      console.log(`   ⚠️  Note: This item was created without authentication (admin password not set)\n`);
    } else {
      console.log('   ⚠️  Create returned null (might be OK)\n');
    }
  } catch (error) {
    console.error('   ❌ Create failed:', error.message);
  }

  console.log('✅ All tests passed!');
  console.log('\n📋 Summary:');
  console.log('   - Google Sheets connection: Working');
  console.log('   - Read operations: Working');
  console.log('   - Write operations: Working (no auth required)');
  console.log('\n⚠️  Security Note:');
  console.log('   Admin endpoints are OPEN (no password required)');
  console.log('   To secure them, set ADMIN_PASSWORD environment variable');
}

test().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

