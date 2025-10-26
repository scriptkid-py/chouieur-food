/**
 * =============================================================================
 * CHOUIEUR EXPRESS API - VERCEL COMPATIBLE
 * =============================================================================
 * 
 * This is the main Express.js server for Vercel deployment.
 * It provides RESTful API endpoints for menu items, orders, and user management.
 * 
 * DATABASE: MongoDB Atlas with Mongoose ODM
 * AUTHENTICATION: JWT for admin and kitchen users only
 * 
 * ENDPOINTS:
 * ==========
 * POST /api/login              - Admin/Kitchen login
 * GET  /api/health             - Health check
 * GET  /api/menu-items        - Get all menu items (public)
 * POST /api/menu-items         - Create menu item (admin only)
 * PUT  /api/menu-items/:id     - Update menu item (admin only)
 * DELETE /api/menu-items/:id   - Delete menu item (admin only)
 * GET  /api/orders             - Get all orders (admin/kitchen)
 * POST /api/orders             - Create new order (public)
 * PUT  /api/orders/:id         - Update order status (admin/kitchen)
 * 
 * ENVIRONMENT VARIABLES:
 * ======================
 * MONGODB_URI      - MongoDB Atlas connection string
 * JWT_SECRET       - JWT secret key
 * NODE_ENV         - Environment (production)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import database configuration and models
const { connectToMongoDB, getConnectionStatus } = require('./config/database');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// CORS configuration for Vercel
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'https://chouieur-express-frontend.onrender.com',
      'https://chouieur-express-ngnypeikq-scriptkid-pys-projects.vercel.app',
      'https://chouieur-express-oxi08tmku-scriptkid-pys-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ];
    
    if (origin && origin.includes('vercel.app')) {
      console.log('Allowing Vercel origin:', origin);
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin in allowed list:', origin);
      callback(null, true);
    } else {
      console.log('Allowing origin for now:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Access-Control-Request-Method', 
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// JWT AUTHENTICATION MIDDLEWARE
// =============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// =============================================================================
// HEALTH CHECK ENDPOINTS
// =============================================================================

// Root endpoint for health checks
app.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express API is running on Vercel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus.status,
      host: dbStatus.host,
      port: dbStatus.port,
      database: dbStatus.database
    },
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      menuItems: '/api/menu-items',
      orders: '/api/orders'
    }
  });
});

// Simple ping endpoint for deployment platforms
app.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: 'OK',
    message: 'Chouieur Express API is running on Vercel',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      host: dbStatus.host,
      port: dbStatus.port,
      database: dbStatus.database
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

// Login endpoint for admin and kitchen users only
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// =============================================================================
// MENU ITEMS ENDPOINTS
// =============================================================================

// Get all menu items (public endpoint)
app.get('/api/menu-items', async (req, res) => {
  try {
    console.log('📋 Fetching menu items from MongoDB...');
    
    const { category, active } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: menuItems,
      source: 'mongodb',
      message: `Successfully fetched ${menuItems.length} menu items`,
      count: menuItems.length
    });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get single menu item (public endpoint)
app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      data: menuItem,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item',
      message: error.message
    });
  }
});

// Create new menu item (admin only)
app.post('/api/menu-items', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('📝 Creating new menu item in MongoDB...');
    
    const menuItemData = req.body;
    const menuItem = new MenuItem(menuItemData);
    const savedMenuItem = await menuItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: savedMenuItem,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item',
      message: error.message
    });
  }
});

// Update menu item (admin only)
app.put('/api/menu-items/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
      message: error.message
    });
  }
});

// Delete menu item (admin only)
app.delete('/api/menu-items/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByIdAndDelete(id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: menuItem,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
      message: error.message
    });
  }
});

// =============================================================================
// ORDERS ENDPOINTS
// =============================================================================

// Get all orders (admin and kitchen only)
app.get('/api/orders', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    console.log('📋 Fetching orders from MongoDB...');
    
    const { status, limit = 50, page = 1 } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('items.menuItemId', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCount = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: orders,
      source: 'mongodb',
      message: `Successfully fetched ${orders.length} orders`,
      count: orders.length,
      totalCount: totalCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get single order (admin and kitchen only)
app.get('/api/orders/:id', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id })
      .populate('items.menuItemId', 'name category price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      data: order,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

// Create new order (public endpoint)
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📝 Creating new order in MongoDB...');
    
    const orderData = req.body;
    
    // Transform the order data to match our schema
    const orderItems = orderData.items.map(item => ({
      menuItemId: item.menuItem?.id || null,
      name: item.menuItem?.name || item.name,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      size: item.size || 'regular',
      specialInstructions: item.specialInstructions || ''
    }));
    
    const newOrder = new Order({
      orderId: `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerEmail: orderData.email || '',
      items: orderItems,
      subtotal: orderData.total,
      total: orderData.total,
      status: 'pending',
      orderType: orderData.orderType || 'delivery',
      paymentMethod: orderData.paymentMethod || 'cash',
      notes: orderData.notes || '',
      deliveryInstructions: orderData.deliveryInstructions || ''
    });
    
    const savedOrder = await newOrder.save();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder.orderId,
      data: savedOrder,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update order status (admin and kitchen only)
app.put('/api/orders/:id', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const order = await Order.findOne({ orderId: id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} does not exist`
      });
    }
    
    await order.updateStatus(status, reason);
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
      message: error.message
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
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =============================================================================
// VERCEL COMPATIBLE EXPORT
// =============================================================================

// For Vercel deployment, export the app instead of starting a server
module.exports = app;
