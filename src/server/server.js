/**
 * =============================================================================
 * EXPRESS SERVER - CHOUIEUR EXPRESS BACKEND
 * =============================================================================
 * 
 * This is the main server file for the Chouieur Express backend API.
 * It sets up Express server, connects to MongoDB Atlas, and provides
 * API endpoints for the food ordering platform.
 * 
 * CONFIGURATION:
 * ==============
 * - PORT: Server port (default: 5000, can be set via environment variable)
 * - MONGO_URI: MongoDB Atlas connection string
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file or Render dashboard.
 * 
 * API ENDPOINTS:
 * ==============
 * - GET /api/health - Health check endpoint
 * - GET /api/orders - Get all orders
 * - POST /api/orders - Create new order
 * - PUT /api/orders/:id - Update order status
 * 
 * FOR RENDER DEPLOYMENT:
 * ======================
 * Set these environment variables in Render dashboard:
 * - MONGO_URI: Your MongoDB Atlas connection string
 * - PORT: Will be automatically set by Render
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectToGoogleSheets, testGoogleSheetsConnection } = require('./sheets');

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// Security middleware
app.use(helmet());

// CORS configuration
// TO CHANGE API URL: Update the origin URL when deploying to production
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Chouieur Express API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import models
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

// Orders API routes
app.get('/api/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let orders;
    if (userId) {
      orders = await Order.getOrdersByUserId(userId);
    } else {
      orders = await Order.getAllOrders();
    }
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.createOrder(req.body);
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.updateOrderStatus(id, status);
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order'
    });
  }
});

// Menu Items API routes
app.get('/api/menu-items', async (req, res) => {
  try {
    const { category } = req.query;
    
    let menuItems;
    if (category) {
      menuItems = await MenuItem.getMenuItemsByCategory(category);
    } else {
      menuItems = await MenuItem.getActiveMenuItems();
    }
    
    res.json({
      success: true,
      menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items'
    });
  }
});

app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item'
    });
  }
});

// Users API routes
app.get('/api/users/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await User.createUser(req.body);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

/**
 * Initialize server and database connection
 * 
 * TO CHANGE MONGODB LOCATION:
 * Update MONGO_URI in your .env file:
 * - MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db
 * - Local Docker: mongodb://localhost:27017/myapp_db
 * - Another PC: mongodb://192.168.1.100:27017/myapp_db
 */
async function startServer() {
  try {
    console.log('🚀 Starting Chouieur Express Backend Server...');
    
    // Connect to Google Sheets
    await connectToGoogleSheets();
    
    // Test the connection
    const isConnected = await testGoogleSheetsConnection();
    
    if (isConnected) {
      console.log('🎉 Google Sheets connection established successfully!');
    } else {
      throw new Error('Failed to establish Google Sheets connection');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log('✅ Server is running');
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database: Google Sheets connected`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 Chouieur Express Backend is ready!');
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error('🔧 Please check your Google Sheets configuration');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
