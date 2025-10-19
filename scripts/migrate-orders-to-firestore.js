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

async function migrateOrdersToFirestore() {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch orders from Google Sheets
    console.log('Fetching orders from Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1000',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      console.log('No orders found in Google Sheets');
      return;
    }

    const headers = values[0];
    const orders = values.slice(1).map((row, index) => {
      const order = {};
      headers.forEach((header, colIndex) => {
        order[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
      });
      order.id = order.orderid || (index + 1).toString();
      return order;
    });

    console.log(`Found ${orders.length} orders to migrate`);

    // Migrate orders to Firestore
    let migratedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        // Parse items if they're stored as JSON string
        let items = [];
        if (order.items) {
          try {
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          } catch (e) {
            console.warn(`Failed to parse items for order ${order.orderid}:`, e.message);
            items = [];
          }
        }

        // Convert string dates to proper format
        let createdAt = admin.firestore.FieldValue.serverTimestamp();
        let updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (order.created_at) {
          try {
            createdAt = new Date(order.created_at);
          } catch (e) {
            console.warn(`Failed to parse created_at for order ${order.orderid}`);
          }
        }
        
        if (order.updated_at) {
          try {
            updatedAt = new Date(order.updated_at);
          } catch (e) {
            console.warn(`Failed to parse updated_at for order ${order.orderid}`);
          }
        }

        const firestoreOrder = {
          orderid: order.orderid || order.id || '',
          userid: order.userid || order.user_id || '',
          customerName: order.customer_name || order.customerName || 'Anonymous',
          customerPhone: order.customer_phone || order.customerPhone || '',
          customerAddress: order.customer_address || order.customerAddress || '',
          items: items,
          total: parseFloat(order.total) || 0,
          status: order.status || 'pending',
          createdAt: createdAt,
          updatedAt: updatedAt,
          email: order.email || '',
          notes: order.notes || '',
          deliveryTime: order.delivery_time || order.deliveryTime || '',
          paymentMethod: order.payment_method || order.paymentMethod || 'cash',
          orderType: order.order_type || order.orderType || 'delivery'
        };

        await db.collection('orders').add(firestoreOrder);
        migratedCount++;
        console.log(`✓ Migrated order: ${order.orderid}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to migrate order ${order.orderid}:`, error.message);
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`✓ Successfully migrated: ${migratedCount} orders`);
    console.log(`✗ Failed to migrate: ${errorCount} orders`);
    console.log(`📊 Total processed: ${orders.length} orders`);

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateOrdersToFirestore()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
