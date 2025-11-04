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
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Import database configuration and models
const { connectToMongoDB, getConnectionStatus } = require('./config/database');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');
const { initGoogleSheets, listMenuItems: sheetsListMenuItems, getMenuItemById: sheetsGetMenuItemById, createMenuItem: sheetsCreateMenuItem, updateMenuItem: sheetsUpdateMenuItem, deleteMenuItem: sheetsDeleteMenuItem, sheetsClient } = require('./services/google-sheets-service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// =============================================================================
// CLOUDINARY CONFIGURATION
// =============================================================================

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

console.log('☁️ Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'
});

// =============================================================================
// SOCKET.IO SETUP FOR REAL-TIME UPDATES
// =============================================================================
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow all origins for Socket.io connections
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'], // Support both transport methods
  allowEIO3: true // Allow older Engine.IO clients
});

// Track connected clients
let connectedClients = 0;

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`🔌 Socket.io client connected (ID: ${socket.id}). Total clients: ${connectedClients}`);

  // Send initial connection confirmation
  socket.emit('connected', {
    message: 'Connected to real-time orders stream',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Send initial orders data when client connects
  // Note: Can't populate Mixed type (menuItemId can be ObjectId or UUID string)
  Order.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
    .then(orders => {
      socket.emit('initialOrders', {
        orders: orders,
        count: orders.length,
        timestamp: new Date().toISOString()
      });
      console.log(`📋 Sent ${orders.length} initial orders to client ${socket.id}`);
    })
    .catch(error => {
      console.error('❌ Error fetching initial orders for Socket.io client:', error);
      socket.emit('error', {
        message: 'Failed to fetch initial orders',
        error: error.message
      });
    });

  // Handle client disconnection
  socket.on('disconnect', (reason) => {
    connectedClients--;
    console.log(`🔌 Socket.io client disconnected (ID: ${socket.id}, reason: ${reason}). Remaining clients: ${connectedClients}`);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`❌ Socket.io error for client ${socket.id}:`, error);
  });
});

console.log('🚀 Socket.io server initialized and ready for connections');

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

// =============================================================================
// IMAGE TO URL CONVERSION HELPER
// =============================================================================

/**
 * Convert uploaded image file to URL
 * Tries Cloudinary first, falls back to Base64 data URL
 * @param {Object} file - Multer file object (req.file)
 * @returns {Promise<string>} - Image URL
 */
async function convertImageToUrl(file) {
  if (!file || !file.path) {
    console.error('❌ No file provided for image conversion');
    return '';
  }

  try {
    console.log(`🔄 Converting image to URL: ${file.originalname} (${file.size} bytes)`);
    
    // Try Cloudinary first (if configured)
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET) {
      try {
        console.log('☁️ Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'chouieur-express/menu-items',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        
        console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
        
        // Clean up temp file
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn('⚠️ Could not clean up temp file:', cleanupError.message);
        }
        
        return result.secure_url;
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError.message);
        console.log('📦 Falling back to Base64 data URL...');
        // Fall through to Base64 fallback
      }
    }
    
    // Fallback: Create Base64 data URL
    console.log('📦 Creating Base64 data URL...');
    
    // Check if file exists before reading
    if (!fs.existsSync(file.path)) {
      console.error('❌ File does not exist at path:', file.path);
      return '';
    }
    
    try {
      const fileBuffer = fs.readFileSync(file.path);
      if (!fileBuffer || fileBuffer.length === 0) {
        console.error('❌ File buffer is empty');
        return '';
      }
      
      const base64Image = fileBuffer.toString('base64');
      const mimeType = file.mimetype || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      
      console.log(`✅ Created Base64 data URL (${dataUrl.length} characters)`);
      
      // Clean up temp file
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp file:', cleanupError.message);
      }
      
      return dataUrl;
    } catch (readError) {
      console.error('❌ Error reading file:', readError.message);
      console.error('❌ Error stack:', readError.stack);
      return '';
    }
  } catch (error) {
    console.error('❌ Error converting image to URL:', error.message);
    console.error('❌ Error stack:', error.stack);
    return '';
  }
}

// =============================================================================
// FILE UPLOAD CONFIGURATION
// =============================================================================

const UPLOADS_DIR = path.join(__dirname, 'uploads');
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
    // Format: Date.now() + "-" + file.originalname
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
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

// Middleware to handle multer errors (must be placed AFTER multer in chain)
const handleMulterError = (err, req, res, next) => {
  // Only handle errors, not normal flow
  if (!err) {
    return next();
  }
  
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large', message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ success: false, error: 'File upload error', message: err.message });
  }
  
  // Handle other upload-related errors
  if (err) {
    console.error('❌ Upload error:', err);
    return res.status(400).json({ success: false, error: 'Upload failed', message: err.message });
  }
  
  next(err);
};

// Middleware to log multer-parsed data
const logMulterData = (req, res, next) => {
  console.log('🔍 Multer middleware - After parsing:');
  console.log('  📦 req.body:', req.body);
  console.log('  📦 req.body keys:', Object.keys(req.body || {}));
  console.log('  📦 req.body values:', {
    name: req.body?.name,
    description: req.body?.description,
    price: req.body?.price,
    category: req.body?.category,
    isActive: req.body?.isActive,
    megaPrice: req.body?.megaPrice
  });
  console.log('  📁 req.file:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file');
  next();
};

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CRITICAL: DO NOT use global body parsers - they interfere with multer!
// Apply JSON parser ONLY to non-file routes that need JSON parsing
const jsonParser = express.json({ limit: '10mb' });
const urlencodedParser = express.urlencoded({ extended: true, limit: '10mb' });

// Apply JSON parsing to specific routes that need it (NOT menu-item routes)
// This ensures multer routes get the raw stream for multipart/form-data

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
// ADMIN AUTHENTICATION (Simple Password-Based)
// =============================================================================

// Simple admin authentication middleware (optional - allows requests if no password set)
const authenticateAdmin = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // If no password is configured, allow all requests (open mode for development)
  if (!adminPassword || adminPassword.trim() === '') {
    console.log('⚠️  Admin password not set - allowing all requests (open mode)');
    req.admin = true;
    return next();
  }

  // If password is configured, require authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Admin authentication required. Please login first.'
    });
  }

  if (token !== adminPassword) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Invalid admin credentials'
    });
  }

  req.admin = true;
  next();
};

// Admin login endpoint (optional - works only if password is configured)
app.post('/api/admin/login', jsonParser, urlencodedParser, async (req, res) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword || adminPassword.trim() === '') {
      return res.status(200).json({
        success: true,
        message: 'Admin password not configured - authentication disabled',
        token: 'no-auth-required',
        authRequired: false
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Missing password',
        message: 'Password is required'
      });
    }

    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Incorrect password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: adminPassword, // Simple token (use JWT in production)
      expiresIn: '24h',
      authRequired: true
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// =============================================================================
// MENU ITEMS ENDPOINTS (with /api/menu aliases)
// =============================================================================

// Get all menu items (public - supports both /api/menu and /api/menu-items)
const handleGetMenuItems = async (req, res) => {
  try {
    console.log('📋 Fetching menu items...');

    const useSheets = !!sheetsClient;

    if (useSheets) {
      const items = await sheetsListMenuItems();
      if (!items) throw new Error('Failed to fetch from Google Sheets');
      
      // Filter by category if provided
      const { category } = req.query;
      let filteredItems = items;
      if (category) {
        filteredItems = items.filter(item => item.category === category);
      }
      
      // Filter active items only
      filteredItems = filteredItems.filter(item => item.isActive !== false);
      
      return res.status(200).json({ 
        success: true, 
        data: filteredItems, 
        source: 'google-sheets', 
        message: `Fetched ${filteredItems.length} menu items`,
        count: filteredItems.length
      });
    }

    const { category, active } = req.query;
    let query = {};
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, data: menuItems, source: 'mongodb', message: `Successfully fetched ${menuItems.length} menu items`, count: menuItems.length });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu items', message: error.message, timestamp: new Date().toISOString() });
  }
};

app.get('/api/menu', handleGetMenuItems);
app.get('/api/menu-items', handleGetMenuItems);

// Get single menu item (supports both /api/menu/:id and /api/menu-items/:id)
const handleGetMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (sheetsClient) {
      const item = await sheetsGetMenuItemById(id);
      if (!item) return res.status(404).json({ success: false, error: 'Menu item not found', message: `Menu item with ID ${id} does not exist` });
      return res.status(200).json({ success: true, data: item, source: 'google-sheets' });
    }
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) return res.status(404).json({ success: false, error: 'Menu item not found', message: `Menu item with ID ${id} does not exist` });
    return res.status(200).json({ success: true, data: menuItem, source: 'mongodb' });
  } catch (error) {
    console.error('❌ Error fetching menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu item', message: error.message });
  }
};

app.get('/api/menu/:id', handleGetMenuItem);
app.get('/api/menu-items/:id', handleGetMenuItem);

// Create new menu item (admin only - supports both /api/menu and /api/menu-items)
// Also supports multipart form data with image upload
const handleCreateMenuItem = async (req, res) => {
  try {
    console.log('📝 Creating new menu item...');
    console.log('🔍 DEBUG: Handler reached - checking req.body and req.file');
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📦 BODY (type):', typeof req.body, 'isArray:', Array.isArray(req.body));
    console.log('📦 BODY (raw):', JSON.stringify(req.body, null, 2));
    console.log('📦 BODY keys:', Object.keys(req.body || {}));
    console.log('📦 BODY entries:', Object.entries(req.body || {}));
    console.log('📁 FILE:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    } : 'No file');
    
    // Check if body is empty or not properly parsed
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('❌ CRITICAL: req.body is empty! Multer may not have parsed the FormData correctly.');
      console.error('❌ Content-Type header:', req.headers['content-type']);
      console.error('❌ File received:', !!req.file);
      
      // Return a detailed error to help debug
      return res.status(400).json({ 
        success: false, 
        error: 'FormData parsing failed',
        message: 'The server received the request but could not parse the form data. Please check that all fields are being sent correctly.',
        debug: {
          hasFile: !!req.file,
          bodyKeys: Object.keys(req.body || {}),
          contentType: req.headers['content-type']
        }
      });
    }
    
    // Extract data directly from req.body (Multer populates this for FormData)
    const { name, description, price } = req.body;
    
    console.log('📋 Extracted from req.body:', {
      name: name,
      description: description,
      price: price,
      nameType: typeof name,
      descriptionType: typeof description,
      priceType: typeof price
    });
    
    // Handle image upload - try Cloudinary first, fallback to file storage or Base64
    let imageUrl = '';
    if (req.file) {
      console.log('🖼️ Image file uploaded with menu item:', req.file.originalname, req.file.size, 'bytes');
      console.log('🖼️ File path:', req.file.path);
      console.log('🖼️ File exists:', fs.existsSync(req.file.path));
      
      // Try Cloudinary first (if configured)
      if (process.env.CLOUDINARY_CLOUD_NAME && 
          process.env.CLOUDINARY_API_KEY && 
          process.env.CLOUDINARY_API_SECRET) {
        try {
          console.log('☁️ Attempting Cloudinary upload...');
          imageUrl = await convertImageToUrl(req.file);
          if (imageUrl) {
            console.log(`✅ Image uploaded to Cloudinary: ${imageUrl.substring(0, 50)}...`);
          } else {
            console.warn('⚠️ Cloudinary returned empty URL, using file storage');
            // Fallback to file storage
            imageUrl = `/uploads/${req.file.filename}`;
            console.log(`✅ Image saved to file system: ${imageUrl}`);
          }
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary upload failed, using file storage:', cloudinaryError.message);
          console.error('❌ Cloudinary error stack:', cloudinaryError.stack);
          imageUrl = `/uploads/${req.file.filename}`;
          console.log(`✅ Image saved to file system: ${imageUrl}`);
        }
      } else {
        // Simple file storage - use the uploaded filename
        console.log('📁 Cloudinary not configured, using file storage');
        imageUrl = `/uploads/${req.file.filename}`;
        console.log(`✅ Image saved to file system: ${imageUrl}`);
      }
    } else {
      console.log('📁 No file uploaded');
    }
    
    console.log('🔄 Extracted values:', {
      name: name,
      description: description,
      price: price,
      imageUrl: imageUrl,
      bodyKeys: Object.keys(req.body || {})
    });
    
    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!name || (typeof name === 'string' && name.trim() === '')) {
      missingFields.push('name');
    }
    if (!description || (typeof description === 'string' && description.trim() === '')) {
      missingFields.push('description');
    }
    if (!price || price === '' || isNaN(parseFloat(String(price)))) {
      missingFields.push('price');
    }
    
    if (missingFields.length > 0) {
      console.error('❌ Validation failed - missing fields:', missingFields);
      console.error('❌ req.body contents:', req.body);
      console.error('❌ req.body type:', typeof req.body);
      console.error('❌ req.body keys:', Object.keys(req.body || {}));
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields,
        received: {
          name: name,
          description: description,
          price: price,
          body: req.body,
          bodyKeys: Object.keys(req.body || {}),
          hasFile: !!req.file
        }
      });
    }
    
    // Prepare menu item data
    const menuItemData = {
      name: typeof name === 'string' ? name.trim() : name,
      description: typeof description === 'string' ? description.trim() : description,
      price: typeof price === 'string' ? parseFloat(price) : Number(price),
      category: req.body.category || 'Sandwiches',
      imageUrl: imageUrl || '',
      isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : true
    };
    
    // Only add megaPrice if it exists and is valid
    if (req.body.megaPrice) {
      const megaPriceValue = typeof req.body.megaPrice === 'string' ? parseFloat(req.body.megaPrice) : Number(req.body.megaPrice);
      if (!isNaN(megaPriceValue) && megaPriceValue > 0) {
        menuItemData.megaPrice = megaPriceValue;
      }
    }
    
    console.log('✅ Processed menu item data:', menuItemData);
    console.log('✅ menuItemData keys:', Object.keys(menuItemData));
    console.log('✅ menuItemData values:', {
      name: menuItemData.name,
      description: menuItemData.description,
      price: menuItemData.price,
      category: menuItemData.category,
      imageUrl: menuItemData.imageUrl ? menuItemData.imageUrl.substring(0, 50) + '...' : 'empty',
      isActive: menuItemData.isActive,
      megaPrice: menuItemData.megaPrice
    });

    if (sheetsClient) {
      console.log('📊 Saving to Google Sheets...');
      try {
        // Generate ID for Google Sheets if not present
        if (!menuItemData.id) {
          menuItemData.id = uuidv4();
        }
        const created = await sheetsCreateMenuItem(menuItemData);
        console.log('✅ Saved to Google Sheets:', created);
      return res.status(201).json({ success: true, message: 'Menu item created successfully', data: created, source: 'google-sheets' });
      } catch (sheetsError) {
        console.error('❌ Google Sheets save failed:', sheetsError);
        console.error('❌ Falling back to MongoDB...');
        // Fall through to MongoDB
      }
    }

    console.log('💾 Saving to MongoDB...');
    try {
      // Validate category against enum before saving
      const validCategories = ['Pizza', 'Burgers', 'Hamburgers', 'Sandwiches', 'Tacos', 'Poulet', 'Panini / Fajitas', 'Plats', 'Salads', 'Appetizers', 'Beverages', 'Sides', 'Desserts'];
      if (!validCategories.includes(menuItemData.category)) {
        console.warn(`⚠️ Category "${menuItemData.category}" not in enum, defaulting to "Sandwiches"`);
        menuItemData.category = 'Sandwiches';
      }
      
      const menuItem = new MenuItem(menuItemData);
    const savedMenuItem = await menuItem.save();
      console.log('✅ Saved to MongoDB:', savedMenuItem);
    return res.status(201).json({ success: true, message: 'Menu item created successfully', data: savedMenuItem, source: 'mongodb' });
    } catch (mongoError) {
      console.error('❌ MongoDB save failed:', mongoError);
      console.error('❌ MongoDB error stack:', mongoError.stack);
      throw mongoError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((e) => e.message);
      console.error('❌ Mongoose validation errors:', validationErrors);
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        message: validationErrors.join(', '),
        validationErrors: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create menu item', 
      message: error.message,
      errorName: error.name,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Request logging middleware for menu-item routes (before multer)
const logMenuRequest = (req, res, next) => {
  console.log('📥 Incoming menu-item request:');
  console.log('  Method:', req.method);
  console.log('  URL:', req.url);
  console.log('  Content-Type:', req.headers['content-type']);
  console.log('  Content-Length:', req.headers['content-length']);
  console.log('  Authorization header present:', !!req.headers['authorization']);
  console.log('  req.body before multer:', req.body);
  console.log('  req.body type:', typeof req.body);
  console.log('  req.body keys:', Object.keys(req.body || {}));
  
  // Verify Content-Type is multipart/form-data
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('multipart/form-data')) {
    console.warn('⚠️  WARNING: Content-Type is not multipart/form-data!');
    console.warn('⚠️  Content-Type:', req.headers['content-type']);
    console.warn('⚠️  This might cause multer parsing issues.');
  }
  
  next();
};

// Menu item routes with proper error handling
// CRITICAL: Multer must process FormData BEFORE any other middleware touches req.body
// Order: Log -> Auth -> Multer -> Log Data -> Handler
// Multer errors are handled by Express error middleware at the end
// Test endpoint to verify multer is working (no auth required for testing)
app.post('/api/test-upload', upload.single('image'), (req, res) => {
  console.log('🧪 TEST UPLOAD - Multer parsing test');
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📦 req.body:', JSON.stringify(req.body, null, 2));
  console.log('📦 req.body keys:', Object.keys(req.body || {}));
  console.log('📁 req.file:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
  res.json({ 
    success: true, 
    body: req.body, 
    bodyKeys: Object.keys(req.body || {}),
    hasFile: !!req.file,
    contentType: req.headers['content-type']
  });
});

app.post('/api/menu', logMenuRequest, authenticateAdmin, upload.single('image'), logMulterData, handleCreateMenuItem);

app.post('/api/menu-items', logMenuRequest, authenticateAdmin, upload.single('image'), logMulterData, handleCreateMenuItem);

// Update menu item (admin only - supports both /api/menu/:id and /api/menu-items/:id)
// Also supports multipart form data with image upload
const handleUpdateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`📝 Updating menu item ID: ${id}`);
    console.log('📦 Request body:', updates);
    console.log('📁 Uploaded file:', req.file ? { name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : 'No file');
    console.log('📋 Content-Type:', req.headers['content-type']);
    
    // If image was uploaded, set the imageUrl
    if (req.file) {
      console.log('🖼️ Image file uploaded with menu item update:', req.file.originalname, req.file.size, 'bytes');
      
      // Try Cloudinary first (if configured)
      if (process.env.CLOUDINARY_CLOUD_NAME && 
          process.env.CLOUDINARY_API_KEY && 
          process.env.CLOUDINARY_API_SECRET) {
        try {
          const imageUrl = await convertImageToUrl(req.file);
          if (imageUrl) {
            updates.imageUrl = imageUrl;
            console.log(`✅ Image uploaded to Cloudinary: ${imageUrl.substring(0, 50)}...`);
          } else {
            // Fallback to file storage
            updates.imageUrl = `/uploads/${req.file.filename}`;
            console.log(`✅ Image saved to file system: ${updates.imageUrl}`);
          }
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary upload failed, using file storage:', cloudinaryError.message);
          updates.imageUrl = `/uploads/${req.file.filename}`;
          console.log(`✅ Image saved to file system: ${updates.imageUrl}`);
        }
      } else {
        // Simple file storage - use the uploaded filename
        updates.imageUrl = `/uploads/${req.file.filename}`;
        console.log(`✅ Image saved to file system: ${updates.imageUrl}`);
      }
    }
    
    // Parse JSON fields if they're strings (from form data)
    if (updates.price && typeof updates.price === 'string') {
      updates.price = parseFloat(updates.price);
    }
    if (updates.megaPrice && typeof updates.megaPrice === 'string') {
      updates.megaPrice = parseFloat(updates.megaPrice);
    }
    if (updates.isActive && typeof updates.isActive === 'string') {
      updates.isActive = updates.isActive === 'true' || updates.isActive === 'TRUE';
    }
    
    if (sheetsClient) {
      const updated = await sheetsUpdateMenuItem(id, updates);
      if (!updated) return res.status(404).json({ success: false, error: 'Menu item not found', message: `Menu item with ID ${id} does not exist` });
      return res.status(200).json({ success: true, message: 'Menu item updated successfully', data: updated, source: 'google-sheets' });
    }
    const menuItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!menuItem) return res.status(404).json({ success: false, error: 'Menu item not found', message: `Menu item with ID ${id} does not exist` });
    return res.status(200).json({ success: true, message: 'Menu item updated successfully', data: menuItem, source: 'mongodb' });
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to update menu item', message: error.message });
  }
};

app.put('/api/menu/:id', authenticateAdmin, upload.single('image'), handleMulterError, handleUpdateMenuItem);
app.put('/api/menu-items/:id', authenticateAdmin, upload.single('image'), handleMulterError, handleUpdateMenuItem);

// Delete menu item (admin only - supports both /api/menu/:id and /api/menu-items/:id)
const handleDeleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Delete request for menu item ID: ${id}`);
    
    if (sheetsClient) {
      console.log('📊 Using Google Sheets for deletion');
      const ok = await sheetsDeleteMenuItem(id);
      if (!ok) {
        console.error(`❌ Failed to delete menu item "${id}" from Google Sheets`);
        return res.status(404).json({ 
          success: false, 
          error: 'Menu item not found', 
          message: `Menu item with ID ${id} does not exist in Google Sheets` 
        });
      }
      console.log(`✅ Successfully deleted menu item "${id}" from Google Sheets`);
      return res.status(200).json({ 
        success: true, 
        message: 'Menu item deleted successfully from Google Sheets', 
        data: { id }, 
        source: 'google-sheets' 
      });
    }
    
    console.log('💾 Using MongoDB for deletion');
    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) {
      console.error(`❌ Menu item "${id}" not found in MongoDB`);
      return res.status(404).json({ 
        success: false, 
        error: 'Menu item not found', 
        message: `Menu item with ID ${id} does not exist` 
      });
    }
    console.log(`✅ Successfully deleted menu item "${id}" from MongoDB`);
    return res.status(200).json({ 
      success: true, 
      message: 'Menu item deleted successfully from MongoDB', 
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
};

app.delete('/api/menu/:id', authenticateAdmin, handleDeleteMenuItem);
app.delete('/api/menu-items/:id', authenticateAdmin, handleDeleteMenuItem);

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
    
    // Note: Can't use populate() on Mixed type (menuItemId can be ObjectId or UUID string)
    // Populate only works with ObjectId references
    const orders = await Order.find(query)
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

// =============================================================================
// SOCKET.IO BROADCAST FUNCTIONS
// =============================================================================

// Function to broadcast order updates to all connected Socket.io clients
function broadcastOrderUpdate(eventName, order) {
  // Convert Mongoose document to plain object for JSON serialization
  const orderData = order.toObject ? order.toObject() : order;
  
  const connectedCount = io.sockets.sockets.size;
  console.log(`📢 Broadcasting ${eventName} to ${connectedCount} Socket.io clients`);
  
  // Emit to all connected clients
  io.emit(eventName, {
    type: eventName,
    order: orderData,
    timestamp: new Date().toISOString()
  });
  
  console.log(`✅ Successfully broadcasted ${eventName} for order: ${orderData.orderId || orderData._id}`);
}

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find order by orderId first (if it looks like ORD-...)
    // Otherwise try by MongoDB _id
    let order = null;
    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: id })
        .populate('items.menuItemId', 'name category price');
    } else {
      // Try MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id)
          .populate('items.menuItemId', 'name category price');
      }
      // If not found, also try orderId field
      if (!order) {
        order = await Order.findOne({ orderId: id })
          .populate('items.menuItemId', 'name category price');
      }
    }
    
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
app.post('/api/orders', jsonParser, urlencodedParser, async (req, res) => {
  try {
    console.log('📝 Creating new order in MongoDB...');
    
    const orderData = req.body;
    
    // Transform the order data to match our schema
    const orderItems = orderData.items.map(item => {
      // Handle menuItemId - can be ObjectId (MongoDB) or String (UUID from Google Sheets)
      let menuItemId = null;
      if (item.menuItemId) {
        // Check if it's a valid MongoDB ObjectId (24 char hex string)
        if (mongoose.Types.ObjectId.isValid(item.menuItemId) && item.menuItemId.toString().length === 24) {
          menuItemId = new mongoose.Types.ObjectId(item.menuItemId);
        } else {
          // Keep as string (UUID from Google Sheets or other string ID)
          menuItemId = String(item.menuItemId);
        }
      } else if (item.menuItem?.id) {
        // Fallback for old format
        const idValue = item.menuItem.id;
        if (mongoose.Types.ObjectId.isValid(idValue) && idValue.toString().length === 24) {
          menuItemId = new mongoose.Types.ObjectId(idValue);
        } else {
          menuItemId = String(idValue);
        }
      }
      
      console.log(`📦 Order item - menuItemId: ${menuItemId} (type: ${typeof menuItemId}, isObjectId: ${menuItemId instanceof mongoose.Types.ObjectId})`);
      
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
    broadcastOrderUpdate('newOrder', savedOrder);
    
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
app.put('/api/orders/:id', jsonParser, urlencodedParser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    // Try to find order by orderId first (if it looks like ORD-...)
    // Otherwise try by MongoDB _id
    let order = null;
    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      // Try MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      // If not found, also try orderId field (in case ID format changed)
      if (!order) {
        order = await Order.findOne({ orderId: id });
      }
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} does not exist`
      });
    }
    
    await order.updateStatus(status, reason);
    
    // Broadcast order update to all connected SSE clients
    broadcastOrderUpdate('updateOrderStatus', order);
    
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

// Assign driver to order
app.patch('/api/orders/:id/assign-driver', jsonParser, urlencodedParser, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverName, driverId } = req.body;
    
    if (!driverName) {
      return res.status(400).json({
        success: false,
        error: 'Driver name is required',
        message: 'Please provide a driver name'
      });
    }
    
    // Try to find order by orderId first (if it looks like ORD-...)
    // Otherwise try by MongoDB _id
    let order = null;
    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      // Try MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      // If not found, also try orderId field
      if (!order) {
        order = await Order.findOne({ orderId: id });
      }
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} does not exist`
      });
    }
    
    // Assign driver
    order.assignedDriver = driverName;
    order.assignedDriverId = driverId || null;
    order.assignedAt = new Date();
    
    await order.save();
    
    // Broadcast order update to all connected clients
    broadcastOrderUpdate('updateOrderStatus', order);
    
    res.status(200).json({
      success: true,
      message: `Driver ${driverName} assigned to order successfully`,
      data: order,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error assigning driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign driver',
      message: error.message
    });
  }
});

// Unassign driver from order
app.patch('/api/orders/:id/unassign-driver', jsonParser, urlencodedParser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find order by orderId first (if it looks like ORD-...)
    // Otherwise try by MongoDB _id
    let order = null;
    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      // Try MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      // If not found, also try orderId field
      if (!order) {
        order = await Order.findOne({ orderId: id });
      }
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} does not exist`
      });
    }
    
    // Unassign driver
    order.assignedDriver = null;
    order.assignedDriverId = null;
    order.assignedAt = null;
    
    await order.save();
    
    // Broadcast order update to all connected clients
    broadcastOrderUpdate('updateOrderStatus', order);
    
    res.status(200).json({
      success: true,
      message: 'Driver unassigned from order successfully',
      data: order,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error unassigning driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unassign driver',
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
app.post('/api/users', jsonParser, urlencodedParser, async (req, res) => {
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

// Upload menu item image to Cloudinary (public endpoint - no auth required)
app.post('/api/menu-items/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('🖼️ Image upload request received');
    console.log('📁 File info:', req.file);
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('❌ Cloudinary not configured, falling back to data URL');
      
      // Fallback to data URL if Cloudinary not configured
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Image = fileBuffer.toString('base64');
      const mimeType = req.file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      
      // Clean up temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp file:', cleanupError.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully (data URL fallback)',
        imageUrl: dataUrl,
        fileName: req.file.filename
      });
    }

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'chouieur-express/menu-items',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('✅ Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height
    });

    // Clean up the temporary file
    try {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up temp file:', cleanupError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.filename,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    
    // Clean up temp file on error
    try {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up temp file on error:', cleanupError.message);
    }

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

// Global error handler (must be last, with 4 parameters for Express to recognize it)
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  // Handle multer errors specifically
  if (error instanceof multer.MulterError || error.code === 'LIMIT_FILE_SIZE') {
    return handleMulterError(error, req, res, next);
  }
  
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
    
    // Start the HTTP server with Socket.io
    server.listen(PORT, () => {
      console.log(`🚀 Chouieur Express Backend is running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: MongoDB (Sheets ${sheetsClient ? 'ENABLED' : 'DISABLED'})`);
      console.log(`🌐 CORS enabled for frontend communication`);
      console.log(`🔌 Socket.io server ready on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();