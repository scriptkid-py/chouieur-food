const { connectToMongoDB, getConnectionStatus } = require('./config/database');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');
const { getMenuItemsFromSheets } = require('./services/google-sheets-service');
const { checkAndArchive } = require('./services/archive-service');

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
    
    // Try Google Sheets first
    let menuItems = await getMenuItemsFromSheets();
    
    if (menuItems && menuItems.length > 0) {
      console.log(`✅ Found ${menuItems.length} menu items from Google Sheets`);
      return res.json({ success: true, menuItems });
    }
    
    // Fallback to MongoDB
    console.log('📦 Falling back to MongoDB...');
    console.log('🔍 Connection status:', getConnectionStatus());
    
    menuItems = await MenuItem.find({ isActive: true });
    console.log(`✅ Found ${menuItems.length} menu items from MongoDB`);
    
    res.json({ success: true, menuItems });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    console.error('Error stack:', error.stack);
    
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
    console.log('📦 Creating order...');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const { customerName, customerPhone, customerAddress, items, total } = req.body;
    
    if (!customerName || !customerPhone || !customerAddress) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: customerName, customerPhone, customerAddress' 
      });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ No items in order');
      return res.status(400).json({ 
        success: false, 
        error: 'Order must contain at least one item' 
      });
    }
    
    console.log('✅ Validated order data');
    
    // Transform items to match the Order schema
    const transformedItems = items.map((item, index) => {
      const cartItem = item;
      const menuItem = cartItem.menuItem || cartItem;
      
      // Extract menuItemId - check multiple possible locations
      const menuItemId = cartItem.menuItemId || menuItem.id || menuItem._id;
      
      if (!menuItemId) {
        console.error(`❌ Missing menuItemId at index ${index}:`, cartItem);
        throw new Error(`Invalid menu item at index ${index}: missing menuItemId`);
      }
      
      // Validate menu item has required fields
      if (!menuItem.name || typeof menuItem.name !== 'string') {
        console.error(`❌ Invalid menu item at index ${index}:`, menuItem);
        throw new Error(`Invalid menu item at index ${index}: missing or invalid name`);
      }
      
      const itemName = String(menuItem.name);
      const itemQuantity = typeof cartItem.quantity === 'number' ? cartItem.quantity : 1;
      
      // Normalize size: only accept recognized values, default to 'regular' for all others
      let itemSize = 'regular'; // Default fallback
      if (cartItem.size === 'Mega' || cartItem.size === 'mega') {
        itemSize = 'mega';
      } else if (cartItem.size === 'Regular' || cartItem.size === 'regular') {
        itemSize = 'regular';
      } else if (cartItem.size == null || cartItem.size === '') {
        // Explicitly handle null/undefined/empty string
        itemSize = 'regular';
      } else {
        // Log unexpected values for debugging
        console.warn(`⚠️ Unexpected size value: "${cartItem.size}" for item "${itemName}", defaulting to 'regular'`);
        itemSize = 'regular';
      }
      
      // Calculate prices safely
      const itemPrice = typeof menuItem.price === 'number' ? menuItem.price : 0;
      const itemMegaPrice = menuItem.megaPrice && typeof menuItem.megaPrice === 'number' ? menuItem.megaPrice : undefined;
      const finalPrice = itemSize === 'mega' && itemMegaPrice ? itemMegaPrice : itemPrice;
      
      // Get special instructions
      const specialInstructions = cartItem.specialInstructions || '';
      
      return {
        menuItemId: menuItemId,
        name: itemName,
        quantity: itemQuantity,
        price: finalPrice,
        totalPrice: typeof cartItem.totalPrice === 'number' ? cartItem.totalPrice : (itemQuantity * finalPrice),
        size: itemSize,
        specialInstructions: specialInstructions
      };
    });
    
    // Calculate subtotal if not provided
    const subtotal = transformedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Create order object
    const orderData = {
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail: req.body.email || '',
      items: transformedItems,
      subtotal: subtotal,
      tax: 0,
      deliveryFee: 0,
      total: total || subtotal,
      status: 'pending',
      orderType: req.body.orderType || 'delivery',
      paymentMethod: req.body.paymentMethod || 'cash',
      paymentStatus: 'pending',
      notes: req.body.notes || '',
      deliveryInstructions: req.body.deliveryInstructions || ''
    };
    
    console.log('📝 Transformed order data:', JSON.stringify(orderData, null, 2));
    
    const order = new Order(orderData);
    await order.save();
    
    console.log('✅ Order saved successfully:', order.orderId);
    
    // Check if database needs archiving (async, don't wait for it)
    checkAndArchive().then(result => {
      if (result.archived > 0) {
        console.log(`📦 Auto-archived ${result.archived} old orders to Google Sheets`);
      }
    }).catch(err => {
      console.error('⚠️ Archive check failed (non-critical):', err.message);
    });
    
    res.status(201).json({ success: true, order, orderId: order.orderId });
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack
    });
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

// =============================================================================
// ARCHIVE MANAGEMENT ENDPOINT
// =============================================================================

/**
 * POST /api/archive - Manually trigger archiving of old orders
 * Archives old completed orders from MongoDB to Google Sheets
 */
app.post('/api/archive', ensureDbConnection, async (req, res) => {
  try {
    console.log('📦 Manual archive triggered...');
    
    const result = await checkAndArchive();
    
    if (result.success) {
      res.json({
        success: true,
        archived: result.archived || 0,
        deleted: result.deleted || 0,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Archive failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Archive endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to archive orders'
    });
  }
});

/**
 * GET /api/archive/status - Check if archiving is needed
 */
app.get('/api/archive/status', ensureDbConnection, async (req, res) => {
  try {
    const { needsArchiving, ARCHIVE_THRESHOLD } = require('./services/archive-service');
    const totalOrders = await Order.countDocuments();
    const shouldArchive = await needsArchiving();
    
    res.json({
      success: true,
      totalOrders,
      threshold: ARCHIVE_THRESHOLD,
      needsArchiving: shouldArchive,
      message: shouldArchive 
        ? `Database has ${totalOrders} orders (threshold: ${ARCHIVE_THRESHOLD}). Archiving recommended.`
        : `Database has ${totalOrders} orders. Archiving not needed.`
    });
  } catch (error) {
    console.error('❌ Archive status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export the app for Vercel serverless functions
module.exports = app;
