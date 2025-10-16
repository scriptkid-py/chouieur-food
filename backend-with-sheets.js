const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Google Sheets helper functions
async function getSheetsInstance() {
  if (GOOGLE_API_KEY) {
    // Use API Key method (simpler)
    return google.sheets({ version: 'v4' });
  } else {
    // Use Service Account method
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    return google.sheets({ version: 'v4', auth });
  }
}

async function readSheetData(range = 'Sheet1!A1:E10') {
  try {
    const sheets = await getSheetsInstance();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: range,
      key: GOOGLE_API_KEY, // Only needed for API key method
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error reading sheet:', error.message);
    throw error;
  }
}

async function writeSheetData(range, values) {
  try {
    const sheets = await getSheetsInstance();
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: { values: values },
      key: GOOGLE_API_KEY, // Only needed for API key method
    });
    return response.data;
  } catch (error) {
    console.error('Error writing to sheet:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend with Google Sheets is running',
    timestamp: new Date().toISOString(),
    sheetsConfigured: !!(GOOGLE_API_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
  });
});

// Test Google Sheets connection
app.get('/api/test-sheets', async (req, res) => {
  try {
    const data = await readSheetData('Sheet1!A1:E5');
    res.json({
      success: true,
      message: 'Google Sheets connection successful',
      data: data,
      rowCount: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google Sheets connection failed',
      error: error.message
    });
  }
});

// Get menu items from Google Sheets
app.get('/api/menu-items', async (req, res) => {
  try {
    // Assuming your menu data is in a sheet called "MenuItems"
    const data = await readSheetData('MenuItems!A1:F100');
    
    if (!data || data.length === 0) {
      return res.json([]);
    }
    
    // Convert sheet data to menu items format
    const headers = data[0];
    const menuItems = data.slice(1).map((row, index) => {
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

// Create new order in Google Sheets
app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    const orderData = [
      new Date().toISOString(),
      order.customerName || 'Anonymous',
      order.items ? JSON.stringify(order.items) : '',
      order.total || 0,
      order.status || 'pending'
    ];
    
    // Append to Orders sheet
    await writeSheetData('Orders!A:E', [orderData]);
    
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

// Get orders from Google Sheets
app.get('/api/orders', async (req, res) => {
  try {
    const data = await readSheetData('Orders!A1:F100');
    
    if (!data || data.length === 0) {
      return res.json([]);
    }
    
    const headers = data[0];
    const orders = data.slice(1).map((row, index) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chouieur Express Backend with Google Sheets running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Sheets test: http://localhost:${PORT}/api/test-sheets`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Sheets ID: ${GOOGLE_SHEETS_ID}`);
  console.log(`🔑 Auth method: ${GOOGLE_API_KEY ? 'API Key' : 'Service Account'}`);
});

module.exports = app;
