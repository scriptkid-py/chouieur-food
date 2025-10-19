const { google } = require('googleapis');
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

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function testOrderFlow() {
  try {
    console.log('Testing order flow...\n');

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test 1: Check Google Sheets orders
    console.log('1. Checking Google Sheets orders...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1000',
    });

    const values = response.data.values || [];
    console.log(`Found ${values.length - 1} orders in Google Sheets`);

    if (values.length > 1) {
      const headers = values[0];
      const orders = values.slice(1).map((row, index) => {
        const order = {};
        headers.forEach((header, colIndex) => {
          order[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
        });
        order.id = order.orderid || (index + 1).toString();
        return order;
      });

      console.log('Recent orders in Google Sheets:');
      orders.slice(0, 3).forEach(order => {
        console.log(`- Order ${order.orderid}: ${order.status} (${order.customer_name})`);
      });
    }

    // Test 2: Check Firebase orders
    console.log('\n2. Checking Firebase orders...');
    const firebaseSnapshot = await db.collection('orders').get();
    console.log(`Found ${firebaseSnapshot.size} orders in Firebase`);

    if (!firebaseSnapshot.empty) {
      console.log('Recent orders in Firebase:');
      firebaseSnapshot.docs.slice(0, 3).forEach(doc => {
        const order = doc.data();
        console.log(`- Order ${order.orderid}: ${order.status} (${order.customerName})`);
      });
    }

    // Test 3: Check for sync issues
    console.log('\n3. Checking for sync issues...');
    if (values.length > 1 && firebaseSnapshot.size > 0) {
      const sheetsOrderIds = values.slice(1).map(row => row[0]).filter(id => id);
      const firebaseOrderIds = firebaseSnapshot.docs.map(doc => doc.data().orderid).filter(id => id);
      
      const missingInFirebase = sheetsOrderIds.filter(id => !firebaseOrderIds.includes(id));
      const missingInSheets = firebaseOrderIds.filter(id => !sheetsOrderIds.includes(id));
      
      if (missingInFirebase.length > 0) {
        console.log(`⚠️  ${missingInFirebase.length} orders missing in Firebase:`, missingInFirebase.slice(0, 3));
      }
      
      if (missingInSheets.length > 0) {
        console.log(`⚠️  ${missingInSheets.length} orders missing in Google Sheets:`, missingInSheets.slice(0, 3));
      }
      
      if (missingInFirebase.length === 0 && missingInSheets.length === 0) {
        console.log('✅ Orders are in sync between Google Sheets and Firebase');
      }
    }

    // Test 4: Test order status update
    console.log('\n4. Testing order status update...');
    if (firebaseSnapshot.size > 0) {
      const testOrder = firebaseSnapshot.docs[0];
      const orderId = testOrder.data().orderid;
      
      console.log(`Testing status update for order: ${orderId}`);
      
      // Update status in Firebase
      await testOrder.ref.update({
        status: 'confirmed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Order status updated in Firebase');
      
      // Check if it's also in Google Sheets
      const orderRowIndex = values.findIndex(row => row[0] === orderId);
      if (orderRowIndex !== -1) {
        console.log('✅ Order found in Google Sheets');
        console.log(`Current status in Google Sheets: ${values[orderRowIndex][7] || 'unknown'}`);
      } else {
        console.log('⚠️  Order not found in Google Sheets');
      }
    }

    console.log('\n🎉 Order flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testOrderFlow()
  .then(() => {
    console.log('\nTest script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
