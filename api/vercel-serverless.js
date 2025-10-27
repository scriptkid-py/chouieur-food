const { connectToMongoDB, getConnectionStatus } = require('./config/database');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');

// Import all the middleware and routes from the main server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// DATABASE CONNECTION MIDDLEWARE
// =============================================================================

const ensureDbConnection = async (req, res, next) => {
  try {
    console.log('🔄 Ensuring database connection...');
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('❌ Database connection failed - returning 503');
      return res.status(503).json({ 
        success: false, 
        error: 'Database connection failed',
        endpoint: req.path 
      });
    }
    console.log('✅ Database connected, proceeding to handler');
    next();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(503).json({ 
      success: false, 
      error: `Database connection error: ${error.message}`,
      endpoint: req.path
    });
  }
};

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = getConnectionStatus();
    
    // Try to connect if not connected
    if (dbStatus.status !== 'connected') {
      await connectToMongoDB();
    }
    
    res.json({
      status: 'OK',
      message: 'Chouieur Express Backend is running',
      timestamp: new Date().toISOString(),
      database: getConnectionStatus(),
      environment: process.env.NODE_ENV || 'production',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Server error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/api/debug', (req, res) => {
  res.json({
    MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    hasURI: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
  });
});

// =============================================================================
// MENU ITEMS ENDPOINTS
// =============================================================================

app.get('/api/menu-items', ensureDbConnection, async (req, res) => {
  try {
    console.log('📦 Fetching menu items...');
    console.log('🔍 Connection status:', getConnectionStatus());
    
    const menuItems = await MenuItem.find({ isActive: true });
    console.log(`✅ Found ${menuItems.length} menu items`);
    
    res.json({ success: true, menuItems });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Always return JSON, never let it fail silently
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/menu-items', ensureDbConnection, async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/menu-items/:id', ensureDbConnection, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/menu-items/:id', ensureDbConnection, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// ORDERS ENDPOINTS
// =============================================================================

app.get('/api/orders', ensureDbConnection, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', ensureDbConnection, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/orders/:id', ensureDbConnection, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// USER ENDPOINTS (LOGIN)
// =============================================================================

app.post('/api/login', ensureDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    res.json({ success: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users', ensureDbConnection, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Export the app for Vercel serverless functions
module.exports = app;
