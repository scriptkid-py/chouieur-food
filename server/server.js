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

const { connectToMongoDB, testMongoDBConnection } = require('./db');

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

// Orders API routes
app.get('/api/orders', async (req, res) => {
  try {
    // TODO: Implement order retrieval logic
    res.json({
      success: true,
      message: 'Orders endpoint - to be implemented',
      orders: []
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
    // TODO: Implement order creation logic
    res.json({
      success: true,
      message: 'Order creation endpoint - to be implemented',
      order: req.body
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
    // TODO: Implement order update logic
    res.json({
      success: true,
      message: 'Order update endpoint - to be implemented',
      orderId: req.params.id,
      updates: req.body
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order'
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
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Test the connection
    const isConnected = await testMongoDBConnection();
    
    if (isConnected) {
      console.log('🎉 Database connection established successfully!');
    } else {
      throw new Error('Failed to establish MongoDB connection');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log('✅ Server is running');
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database: MongoDB Atlas connected`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 Chouieur Express Backend is ready!');
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error('🔧 Please check your MongoDB configuration');
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
