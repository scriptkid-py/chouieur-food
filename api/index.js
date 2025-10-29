/**
 * =============================================================================
 * CHOUIEUR EXPRESS API - MONGODB BACKEND
 * =============================================================================
 * 
 * This is the main Express.js server for the Chouieur Express application.
 * It provides RESTful API endpoints for menu items, orders, and user management.
 * 
 * DATABASE: MongoDB with Mongoose ODM
 * FEATURES: Menu management, Order processing, User management, File uploads
 * 
 * ENDPOINTS:
 * ==========
 * GET  /api/health              - Health check
 * GET  /api/menu-items          - Get all menu items
 * POST /api/menu-items          - Create new menu item
 * PUT  /api/menu-items/:id      - Update menu item
 * DELETE /api/menu-items/:id    - Delete menu item
 * GET  /api/orders              - Get all orders
 * POST /api/orders              - Create new order
 * PUT  /api/orders/:id          - Update order status
 * GET  /api/users               - Get all users
 * POST /api/users               - Create new user
 * PUT  /api/users/:id           - Update user
 * 
 * ENVIRONMENT VARIABLES:
 * ======================
 * PORT              - Server port (default: 3001)
 * MONGO_URI         - MongoDB connection string
 * NODE_ENV          - Environment (development/production)
 * FRONTEND_URL      - Frontend URL for CORS
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
require('dotenv').config();

// Import database configuration and models
const { connectToMongoDB, getConnectionStatus } = require('./config/database');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }
    const allowedOrigins = [
      process.env.FRONTEND_URL,
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
    if (origin === 'https://chouieur-express-frontend.onrender.com') {
      console.log('Allowing Render frontend origin:', origin);
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin in allowed list:', origin);
      callback(null, true);
    } else {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('Allowing localhost origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        console.log('Allowing blocked origin for now:', origin); // Temporarily allow all for debugging
        callback(null, true);
      }
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
// FILE UPLOAD CONFIGURATION
// =============================================================================

const UPLOADS_DIR = path.join(__dirname, 'uploads', 'menu-images');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'), false);
    }
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================================================
// HEALTH CHECK ENDPOINTS
// =============================================================================

// Root endpoint for health checks
app.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend with MongoDB is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus.status,
      host: dbStatus.host,
      port: dbStatus.port,
      database: dbStatus.database
    },
    endpoints: {
      health: '/api/health',
      menuItems: '/api/menu-items',
      orders: '/api/orders',
      users: '/api/users'
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
    message: 'Chouieur Express Backend with MongoDB is running',
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
// MENU ITEMS ENDPOINTS
// =============================================================================

// Get all menu items
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

// Get single menu item
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

// Create new menu item
app.post('/api/menu-items', async (req, res) => {
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

// Update menu item
app.put('/api/menu-items/:id', async (req, res) => {
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

// Delete menu item
app.delete('/api/menu-items/:id', async (req, res) => {
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

// Get all orders
app.get('/api/orders', async (req, res) => {
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

// =============================================================================
// REAL-TIME SSE ENDPOINT FOR ORDERS
// =============================================================================

// Store connected SSE clients
const sseClients = new Set();

// SSE endpoint for real-time order updates
app.get('/api/orders/stream', (req, res) => {
  console.log('📡 New SSE client connected for real-time orders');
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Send initial connection message
  res.write('data: ' + JSON.stringify({ type: 'connected', message: 'Connected to real-time orders stream' }) + '\n\n');

  // Add client to set
  sseClients.add(res);

  // Send initial orders data
  Order.find({})
    .populate('items.menuItemId', 'name category')
    .sort({ createdAt: -1 })
    .limit(50)
    .then(orders => {
      res.write('data: ' + JSON.stringify({ 
        type: 'initial', 
        orders: orders 
      }) + '\n\n');
    })
    .catch(error => {
      console.error('Error fetching initial orders:', error);
    });

  // Remove client on connection close
  req.on('close', () => {
    console.log('📡 SSE client disconnected');
    sseClients.delete(res);
  });
});

// Function to broadcast order updates to all connected clients
function broadcastOrderUpdate(type, order) {
  console.log(`📢 Broadcasting ${type} to ${sseClients.size} clients`);
  const data = JSON.stringify({ type, order });
  
  sseClients.forEach(client => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error('Error broadcasting to client:', error);
      sseClients.delete(client);
    }
  });
}

// Get single order
app.get('/api/orders/:id', async (req, res) => {
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

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📝 Creating new order in MongoDB...');
    
    const orderData = req.body;
    
    // Transform the order data to match our schema
    const orderItems = orderData.items.map(item => {
      // Handle menuItemId - can be string or ObjectId
      let menuItemId = null;
      if (item.menuItemId) {
        // Convert string to ObjectId if it's a valid ObjectId string
        if (mongoose.Types.ObjectId.isValid(item.menuItemId)) {
          menuItemId = new mongoose.Types.ObjectId(item.menuItemId);
        } else {
          menuItemId = item.menuItemId; // Keep as is if not valid ObjectId format
        }
      } else if (item.menuItem?.id) {
        // Fallback for old format
        if (mongoose.Types.ObjectId.isValid(item.menuItem.id)) {
          menuItemId = new mongoose.Types.ObjectId(item.menuItem.id);
        } else {
          menuItemId = item.menuItem.id;
        }
      }
      
      return {
        menuItemId: menuItemId,
        name: item.name || item.menuItem?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        size: item.size || 'regular',
        specialInstructions: item.specialInstructions || ''
      };
    });
    
    const newOrder = new Order({
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
    
    // Broadcast new order to all connected SSE clients
    broadcastOrderUpdate('orderCreated', savedOrder);
    
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

// Update order status
app.put('/api/orders/:id', async (req, res) => {
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
    
    // Broadcast order update to all connected SSE clients
    broadcastOrderUpdate('orderUpdated', order);
    
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
// USERS ENDPOINTS
// =============================================================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    console.log('📋 Fetching users from MongoDB...');
    
    const { role, active } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const users = await User.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: users,
      source: 'mongodb',
      message: `Successfully fetched ${users.length} users`,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    console.log('📝 Creating new user in MongoDB...');
    
    const userData = req.body;
    const user = new User(userData);
    const savedUser = await user.save();
    
    res.status(201).json({
        success: true,
      message: 'User created successfully',
      data: savedUser,
      source: 'mongodb'
      });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// =============================================================================
// FILE UPLOAD ENDPOINTS
// =============================================================================

// Upload menu item image
app.post('/api/menu-items/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const imageUrl = `/uploads/menu-images/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      fileName: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

// Delete menu item image
app.delete('/api/menu-items/delete-image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ success: true, message: `Image ${filename} deleted successfully.` });
    } else {
      res.status(404).json({ success: false, message: `Image ${filename} not found.` });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      message: error.message
    });
  }
});

// =============================================================================
// ADMIN STATISTICS ENDPOINT
// =============================================================================

app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('📊 Fetching admin statistics from MongoDB...');
    
    const [
      menuItemsCount,
      ordersCount,
      usersCount,
      orderStats,
      recentOrders
    ] = await Promise.all([
      MenuItem.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ isActive: true }),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$total' }
          }
        }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('items.menuItemId', 'name')
    ]);
    
    const stats = {
      menuItems: menuItemsCount,
      orders: ordersCount,
      users: usersCount,
      orderStatuses: orderStats,
      recentOrders: recentOrders,
      source: 'mongodb'
    };
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Admin statistics fetched successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics',
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
// SERVER STARTUP
// =============================================================================

async function startServer() {
  try {
    // Try to connect to MongoDB (don't exit if fails - allow for retry)
    try {
      const dbConnected = await connectToMongoDB();
      if (!dbConnected) {
        console.warn('⚠️  MongoDB connection failed, but server will start anyway');
      }
    } catch (dbError) {
      console.error('⚠️  MongoDB connection error:', dbError.message);
      console.log('🚀 Starting server anyway to allow for retry...');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Chouieur Express Backend is running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: MongoDB`);
      console.log(`🌐 CORS enabled for frontend communication`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export app for serverless functions
module.exports = app;
