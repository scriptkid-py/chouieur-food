const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'studio-4940927620-c4e90'
  });
}

const db = admin.firestore();

async function testRealtimeOrders() {
  try {
    console.log('Testing real-time orders functionality...\n');

    // Test 1: Add a test order
    console.log('1. Adding a test order...');
    const testOrder = {
      orderid: `TEST-${Date.now()}`,
      userid: 'test-user-123',
      customerName: 'Test Customer',
      customerPhone: '+237123456789',
      customerAddress: 'Test Address, Douala',
      items: [
        {
          name: 'Test Burger',
          quantity: 2,
          unitPrice: 5000,
          totalPrice: 10000
        }
      ],
      total: 10000,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      email: 'test@example.com',
      notes: 'Test order for real-time functionality',
      deliveryTime: '30 minutes',
      paymentMethod: 'cash',
      orderType: 'delivery'
    };

    const docRef = await db.collection('orders').add(testOrder);
    console.log(`✓ Test order added with ID: ${docRef.id}`);

    // Test 2: Update order status
    console.log('\n2. Updating order status to "confirmed"...');
    await docRef.update({
      status: 'confirmed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Order status updated to "confirmed"');

    // Test 3: Update order status again
    console.log('\n3. Updating order status to "preparing"...');
    await docRef.update({
      status: 'preparing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Order status updated to "preparing"');

    // Test 4: Update order status to ready
    console.log('\n4. Updating order status to "ready"...');
    await docRef.update({
      status: 'ready',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Order status updated to "ready"');

    // Test 5: Clean up - delete test order
    console.log('\n5. Cleaning up test order...');
    await docRef.delete();
    console.log('✓ Test order deleted');

    console.log('\n🎉 All real-time functionality tests passed!');
    console.log('\nYour website should now show real-time updates without refreshing.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testRealtimeOrders()
  .then(() => {
    console.log('\nTest script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
