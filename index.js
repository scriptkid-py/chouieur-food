const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Google Sheets authentication
let sheets;
let auth;

async function initializeGoogleSheets() {
  try {
    if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.log('⚠️  Google Sheets credentials not configured, running without Sheets integration');
      return false;
    }

    // Clean the private key
    const cleanPrivateKey = GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .trim();

    // Create GoogleAuth with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: cleanPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create sheets API instance
    sheets = google.sheets({ version: 'v4', auth });

    console.log('✅ Google Sheets authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets authentication failed:', error.message);
    console.log('⚠️  Running without Google Sheets integration');
    return false;
  }
}

// Root endpoint for Render health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      testSheets: '/api/test-sheets',
      data: '/api/data'
    }
  });
});

// Simple ping endpoint for Render
app.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend with Google Sheets is running',
    timestamp: new Date().toISOString(),
    sheetsConfigured: !!sheets
  });
});

// Test Google Sheets connection
app.get('/api/test-sheets', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        success: false,
        message: 'Google Sheets not initialized. Check your environment variables and service account permissions.',
        troubleshooting: {
          steps: [
            '1. Verify GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set',
            '2. Enable Google Sheets API in Google Cloud Console',
            '3. Share your Google Sheet with the service account email',
            '4. Check that the private key is properly formatted'
          ]
        }
      });
    }

    // Test read access
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'A1:E5',
    });

    const values = response.data.values || [];
    
    res.json({
      success: true,
      message: 'Google Sheets connection successful',
      data: values,
      rowCount: values.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google Sheets connection failed',
      error: error.message,
      troubleshooting: {
        commonIssues: [
          'Private key format issue - ensure proper line breaks',
          'Google Sheets API not enabled',
          'Service account lacks permissions',
          'Sheet not shared with service account'
        ]
      }
    });
  }
});

// GET /data - Read data from Google Sheets
app.get('/api/data', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { range = 'A1:Z100' } = req.query;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: range,
    });

    const values = response.data.values || [];
    
    // Convert to objects if there are headers
    let data = values;
    if (values.length > 0) {
      const headers = values[0];
      data = values.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    }

    res.json({
      success: true,
      data: data,
      totalRows: values.length
    });
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to read data from Google Sheets',
      message: error.message
    });
  }
});

// POST /data - Add new row to Google Sheets
app.post('/api/data', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { data, range = 'A:Z' } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Data must be an array'
      });
    }

    // Append data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [data]
      }
    });

    res.json({
      success: true,
      message: 'Data added successfully',
      updatedRows: response.data.updates?.updatedRows || 1
    });
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to write data to Google Sheets',
      message: error.message
    });
  }
});

// Menu items endpoints
app.get('/api/menu-items', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    // Read from MenuItems sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:F100',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.json([]);
    }

    const headers = values[0];
    const menuItems = values.slice(1).map((row, index) => {
      const item = {};
      headers.forEach((header, colIndex) => {
        item[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
      });
      item.id = (index + 1).toString();
      return item;
    });

    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:F100',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.json([]);
    }

    const headers = values[0];
    const orders = values.slice(1).map((row, index) => {
      const order = {};
      headers.forEach((header, colIndex) => {
        order[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
      });
      order.id = (index + 1).toString();
      return order;
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const order = req.body;
    const orderData = [
      new Date().toISOString(),
      order.customerName || 'Anonymous',
      order.items ? JSON.stringify(order.items) : '',
      order.total || 0,
      order.status || 'pending',
      order.email || ''
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A:F',
      valueInputOption: 'RAW',
      resource: {
        values: [orderData]
      }
    });

    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: Date.now().toString(),
      order: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize Google Sheets and start server
async function startServer() {
  console.log('🚀 Starting Chouieur Express Backend...');
  
  const sheetsInitialized = await initializeGoogleSheets();
  
  if (!sheetsInitialized) {
    console.log('⚠️  Warning: Google Sheets not initialized. Some endpoints will not work.');
    console.log('📋 Make sure to set the following environment variables:');
    console.log('   - GOOGLE_SHEETS_ID');
    console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('   - GOOGLE_PRIVATE_KEY');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Sheets test: http://localhost:${PORT}/api/test-sheets`);
    console.log(`📋 Sheets ID: ${GOOGLE_SHEETS_ID || 'Not configured'}`);
    console.log(`🚀 Server bound to 0.0.0.0:${PORT} for Render deployment`);
  });
}

startServer().catch(console.error);

module.exports = app;
