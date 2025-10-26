const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage for all data
let inMemoryOrders = [
  {
    orderid: 'ORD-1732051200000-abc123',
    userid: 'user123',
    customerName: 'John Doe',
    customerPhone: '+237123456789',
    customerAddress: '123 Main St, Douala',
    items: [
      { name: 'Pizza Margherita', quantity: 2, price: 5000, totalPrice: 10000 },
      { name: 'Coca Cola', quantity: 1, price: 1000, totalPrice: 1000 }
    ],
    total: 11000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    email: 'john@example.com',
    notes: '',
    deliveryTime: '',
    paymentMethod: 'cash',
    orderType: 'delivery'
  },
  {
    orderid: 'ORD-1732051200001-def456',
    userid: 'user456',
    customerName: 'Jane Smith',
    customerPhone: '+237987654321',
    customerAddress: '456 Oak Ave, Yaounde',
    items: [
      { name: 'Burger Deluxe', quantity: 1, price: 8000, totalPrice: 8000 }
    ],
    total: 8000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    email: 'jane@example.com',
    notes: 'Extra cheese please',
    deliveryTime: '',
    paymentMethod: 'card',
    orderType: 'delivery'
  }
];

let inMemoryMenuItems = [
  {
    id: '1',
    name: 'Pizza Margherita',
    category: 'Pizza',
    price: 5000,
    megaPrice: 7000,
    description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    id: '2',
    name: 'Burger Deluxe',
    category: 'Burgers',
    price: 8000,
    megaPrice: 10000,
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    id: '3',
    name: 'Chicken Wings',
    category: 'Appetizers',
    price: 4000,
    description: 'Crispy chicken wings with your choice of sauce',
    imageUrl: 'https://images.unsplash.com/photo-1567620832904-9fe5cf23db13?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    id: '4',
    name: 'Caesar Salad',
    category: 'Salads',
    price: 3500,
    description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    id: '5',
    name: 'Coca Cola',
    category: 'Beverages',
    price: 1000,
    description: 'Refreshing cola drink',
    imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop',
    isActive: true
  },
  {
    id: '6',
    name: 'French Fries',
    category: 'Sides',
    price: 2500,
    description: 'Crispy golden french fries',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    isActive: true
  }
];

// Image upload configuration
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
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(morgan('combined'));

// Enhanced CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://chouieur-express-frontend.onrender.com',
      'https://chouieur-express-fqy6rwo98-scriptkid-pys-projects.vercel.app',
      'https://chouieur-express-fgb1y5hir-scriptkid-pys-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ];
    
    // Always allow Vercel deployments
    if (origin && origin.includes('vercel.app')) {
      console.log('Allowing Vercel origin:', origin);
      return callback(null, true);
    }
    
    // Always allow the specific Render frontend URL
    if (origin === 'https://chouieur-express-frontend.onrender.com') {
      console.log('Allowing Render frontend origin:', origin);
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin in allowed list:', origin);
      callback(null, true);
    } else {
      // For development, allow any localhost origin
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('Allowing localhost origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        // For now, allow all origins to fix the issue
        console.log('Allowing blocked origin for now:', origin);
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

// Handle preflight requests explicitly for all routes
app.options('*', (req, res) => {
  console.log('Handling preflight request for:', req.path);
  console.log('Origin:', req.headers.origin);
  
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

app.use(express.json());

// Test endpoint to verify CORS is working
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint for health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    dataSource: 'in-memory',
    endpoints: {
      health: '/api/health',
      menuItems: '/api/menu-items',
      orders: '/api/orders'
    }
  });
});

// Simple ping endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend with in-memory storage is running',
    timestamp: new Date().toISOString(),
    dataSource: 'in-memory',
    menuItemsCount: inMemoryMenuItems.length,
    ordersCount: inMemoryOrders.length
  });
});

// ==================== MENU ITEMS ENDPOINTS ====================

// Get all menu items
app.get('/api/menu-items', async (req, res) => {
  // Add CORS headers specifically for this endpoint
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    console.log('📋 Fetching menu items from in-memory storage...');
    
    res.status(200).json({
      success: true,
      data: inMemoryMenuItems,
      source: 'in-memory',
      message: `Successfully fetched ${inMemoryMenuItems.length} menu items`,
      count: inMemoryMenuItems.length
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

// Create new menu item
app.post('/api/menu-items', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, megaPrice, description, imageId } = req.body;
    
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category, price, description'
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/menu-images/${req.file.filename}`;
    } else if (imageId) {
      imageUrl = imageId;
    }

    const newMenuItem = {
      id: (inMemoryMenuItems.length + 1).toString(),
      name,
      category,
      price: parseFloat(price),
      megaPrice: megaPrice ? parseFloat(megaPrice) : undefined,
      description,
      imageUrl: imageUrl || '',
      isActive: true
    };

    inMemoryMenuItems.push(newMenuItem);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      menuItem: newMenuItem,
      source: 'in-memory'
    });
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update menu item
app.put('/api/menu-items/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, megaPrice, description, imageId } = req.body;

    const menuItemIndex = inMemoryMenuItems.findIndex(item => item.id === id);
    if (menuItemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/menu-images/${req.file.filename}`;
    } else if (imageId) {
      imageUrl = imageId;
    } else {
      imageUrl = inMemoryMenuItems[menuItemIndex].imageUrl;
    }

    // Update the menu item
    inMemoryMenuItems[menuItemIndex] = {
      ...inMemoryMenuItems[menuItemIndex],
      name: name || inMemoryMenuItems[menuItemIndex].name,
      category: category || inMemoryMenuItems[menuItemIndex].category,
      price: price ? parseFloat(price) : inMemoryMenuItems[menuItemIndex].price,
      megaPrice: megaPrice ? parseFloat(megaPrice) : inMemoryMenuItems[menuItemIndex].megaPrice,
      description: description || inMemoryMenuItems[menuItemIndex].description,
      imageUrl: imageUrl
    };

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem: inMemoryMenuItems[menuItemIndex],
      source: 'in-memory'
    });
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ORDERS ENDPOINTS ====================

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📋 Fetching orders from in-memory storage...');
    
    res.status(200).json({
      success: true,
      data: inMemoryOrders,
      source: 'in-memory',
      message: `Successfully fetched ${inMemoryOrders.length} orders`,
      count: inMemoryOrders.length
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

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare order data
    const orderData = {
      orderid: orderId,
      userid: order.userId || '',
      customerName: order.customerName || 'Anonymous',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      items: order.items || [],
      total: order.total || 0,
      status: order.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      email: order.email || '',
      notes: order.notes || '',
      deliveryTime: order.deliveryTime || '',
      paymentMethod: order.paymentMethod || 'cash',
      orderType: order.orderType || 'delivery'
    };

    console.log('📝 Storing new order in in-memory storage');
    inMemoryOrders.push(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: orderId,
      order: orderData,
      source: 'in-memory'
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
app.put('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('📝 Updating order status...');
    
    const { orderId } = req.params;
    const { status, notes } = req.body;

    console.log('Looking for order:', orderId, 'with status:', status);

    const orderIndex = inMemoryOrders.findIndex(order => order.orderid === orderId);
    
    if (orderIndex === -1) {
      console.log('Order not found');
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    inMemoryOrders[orderIndex].status = status;
    if (notes) {
      inMemoryOrders[orderIndex].notes = notes;
    }
    inMemoryOrders[orderIndex].updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      orderId: orderId,
      order: inMemoryOrders[orderIndex],
      source: 'in-memory'
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin statistics endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Process orders
    let totalOrders = inMemoryOrders.length;
    let pendingOrders = 0;
    let confirmedOrders = 0;
    let readyOrders = 0;
    let deliveredOrders = 0;
    let totalRevenue = 0;
    const recentOrders = [];

    inMemoryOrders.forEach((order, index) => {
      // Count by status
      const status = order.status?.toLowerCase();
      switch (status) {
        case 'pending':
          pendingOrders++;
          break;
        case 'confirmed':
          confirmedOrders++;
          break;
        case 'ready':
          readyOrders++;
          break;
        case 'delivered':
          deliveredOrders++;
          break;
      }

      // Calculate revenue
      const total = parseFloat(order.total) || 0;
      totalRevenue += total;

      // Get recent orders (last 10)
      if (index < 10) {
        recentOrders.push({
          id: order.orderid,
          customer: order.customerName || 'Anonymous',
          total: total,
          status: status || 'pending',
          time: order.createdAt,
          items: order.items || []
        });
      }
    });

    // Process menu items
    let totalMenuItems = inMemoryMenuItems.length;
    let activeMenuItems = 0;
    let menuItemsWithImages = 0;
    const categories = new Set();

    inMemoryMenuItems.forEach(item => {
      // Count active items
      if (item.isActive !== false) {
        activeMenuItems++;
      }

      // Count items with images
      if (item.imageUrl && item.imageUrl.trim() !== '') {
        menuItemsWithImages++;
      }

      // Count categories
      if (item.category) {
        categories.add(item.category);
      }
    });

    const stats = {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        ready: readyOrders,
        delivered: deliveredOrders,
        growth: totalOrders > 0 ? Math.round((totalOrders / 30) * 100) / 100 : 0
      },
      revenue: {
        total: totalRevenue,
        growth: totalRevenue > 0 ? Math.round((totalRevenue / 30) * 100) / 100 : 0
      },
      menu: {
        total: totalMenuItems,
        active: activeMenuItems,
        withImages: menuItemsWithImages,
        categories: categories.size
      },
      recentOrders: recentOrders
    };

    res.status(200).json({
      success: true,
      data: stats,
      source: 'in-memory'
    });

  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Starting Chouieur Express Backend...');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Menu items: http://localhost:${PORT}/api/menu-items`);
  console.log(`📦 Orders: http://localhost:${PORT}/api/orders`);
  console.log(`🚀 Server bound to 0.0.0.0:${PORT} for deployment`);
  console.log(`💾 Data source: in-memory storage`);
});

module.exports = app;