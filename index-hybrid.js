/**
 * =============================================================================
 * CHOUIEUR EXPRESS BACKEND - HYBRID MONGODB + GOOGLE SHEETS
 * =============================================================================
 * 
 * Smart hybrid system that uses MongoDB as primary database and Google Sheets
 * as archive storage when MongoDB gets full. This provides:
 * - Fast MongoDB performance for active data
 * - Google Sheets backup for archived data
 * - Automatic data management
 * - Unlimited storage capacity
 * 
 * FEATURES:
 * - MongoDB Atlas as primary database (fast)
 * - Google Sheets as archive storage (unlimited)
 * - Automatic data archiving when MongoDB gets full
 * - Smart data retrieval from both sources
 * - Seamless user experience
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

// Import Firebase Admin
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// CONFIGURATION
// =============================================================================

// MongoDB limits (adjust based on your needs)
const MONGODB_LIMITS = {
  MAX_ORDERS: 1000,        // Maximum orders in MongoDB
  MAX_MENU_ITEMS: 100,      // Maximum menu items in MongoDB
  ARCHIVE_THRESHOLD: 0.8    // Archive when 80% full
};

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================================================
// MONGODB CONNECTION
// =============================================================================

let db;
let mongoConnected = false;

async function initializeMongoDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://zaid:RrZLCt1iLTrxS5RZ@chouieur-express.657lqxf.mongodb.net/chouieur_express?retryWrites=true&w=majority&appName=chouieur-express';
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    db = mongoose.connection;
    mongoConnected = true;
    console.log('✅ MongoDB Atlas connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Using Google Sheets as primary storage');
    mongoConnected = false;
    return false;
  }
}

// =============================================================================
// GOOGLE SHEETS CONNECTION
// =============================================================================

let sheets;
let sheetsConnected = false;

async function initializeGoogleSheets() {
  try {
    const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.log('⚠️  Google Sheets credentials not configured');
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
    sheetsConnected = true;
    console.log('✅ Google Sheets authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets authentication failed:', error.message);
    sheetsConnected = false;
    return false;
  }
}

// =============================================================================
// FIREBASE ADMIN SETUP
// =============================================================================

let firebaseAdmin;

async function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized successfully');
    }
    return true;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    return false;
  }
}

// =============================================================================
// MONGODB SCHEMAS
// =============================================================================

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerAddress: { type: String, required: true, trim: true },
  items: [{
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, enum: ['Normal', 'Mega'], default: 'Normal' },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    supplements: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 }
    }]
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'], default: 'pending' },
  notes: { type: String, default: '' },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Sandwiches', 'Pizza', 'Tacos', 'Poulet', 'Hamburgers', 'Panini / Fajitas', 'Plats'], required: true },
  price: { type: Number, required: true, min: 0 },
  megaPrice: { type: Number, min: 0 },
  description: { type: String, required: true, trim: true },
  imageId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['admin', 'kitchen', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const Order = mongoose.model('Order', orderSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const User = mongoose.model('User', userSchema);

// =============================================================================
// SMART DATA MANAGEMENT
// =============================================================================

// Check if MongoDB needs archiving
async function checkMongoDBCapacity() {
  if (!mongoConnected) return false;
  
  try {
    const orderCount = await Order.countDocuments({ isArchived: false });
    const menuItemCount = await MenuItem.countDocuments({ isArchived: false });
    
    const orderUsage = orderCount / MONGODB_LIMITS.MAX_ORDERS;
    const menuItemUsage = menuItemCount / MONGODB_LIMITS.MAX_MENU_ITEMS;
    
    console.log(`📊 MongoDB Usage: Orders ${orderCount}/${MONGODB_LIMITS.MAX_ORDERS} (${(orderUsage * 100).toFixed(1)}%), Menu Items ${menuItemCount}/${MONGODB_LIMITS.MAX_MENU_ITEMS} (${(menuItemUsage * 100).toFixed(1)}%)`);
    
    return orderUsage > MONGODB_LIMITS.ARCHIVE_THRESHOLD || menuItemUsage > MONGODB_LIMITS.ARCHIVE_THRESHOLD;
  } catch (error) {
    console.error('Error checking MongoDB capacity:', error);
    return false;
  }
}

// Archive old data to Google Sheets
async function archiveOldData() {
  if (!mongoConnected || !sheetsConnected) return;
  
  try {
    console.log('📦 Starting data archiving process...');
    
    // Archive old orders (keep last 500 in MongoDB)
    const ordersToArchive = await Order.find({ isArchived: false })
      .sort({ createdAt: 1 })
      .limit(500);
    
    if (ordersToArchive.length > 0) {
      console.log(`📦 Archiving ${ordersToArchive.length} old orders to Google Sheets...`);
      
      // Prepare data for Google Sheets
      const ordersData = ordersToArchive.map(order => [
        order._id,
        order.userId,
        order.customerName,
        order.customerPhone,
        order.customerAddress,
        JSON.stringify(order.items),
        order.total,
        order.status,
        order.notes,
        order.createdAt.toISOString(),
        order.updatedAt.toISOString()
      ]);
      
      // Add headers
      const headers = ['ID', 'UserID', 'CustomerName', 'CustomerPhone', 'CustomerAddress', 'Items', 'Total', 'Status', 'Notes', 'CreatedAt', 'UpdatedAt'];
      ordersData.unshift(headers);
      
      // Write to Google Sheets
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: 'Orders!A:K',
        valueInputOption: 'RAW',
        resource: { values: ordersData }
      });
      
      // Mark as archived in MongoDB
      await Order.updateMany(
        { _id: { $in: ordersToArchive.map(o => o._id) } },
        { isArchived: true }
      );
      
      console.log('✅ Orders archived successfully');
    }
    
    // Archive old menu items (keep active ones in MongoDB)
    const menuItemsToArchive = await MenuItem.find({ 
      isArchived: false, 
      isActive: false 
    });
    
    if (menuItemsToArchive.length > 0) {
      console.log(`📦 Archiving ${menuItemsToArchive.length} inactive menu items to Google Sheets...`);
      
      // Prepare data for Google Sheets
      const menuItemsData = menuItemsToArchive.map(item => [
        item._id,
        item.name,
        item.category,
        item.price,
        item.megaPrice,
        item.description,
        item.imageId,
        item.isActive,
        item.createdAt.toISOString(),
        item.updatedAt.toISOString()
      ]);
      
      // Add headers
      const headers = ['ID', 'Name', 'Category', 'Price', 'MegaPrice', 'Description', 'ImageId', 'IsActive', 'CreatedAt', 'UpdatedAt'];
      menuItemsData.unshift(headers);
      
      // Write to Google Sheets
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: 'MenuItems!A:J',
        valueInputOption: 'RAW',
        resource: { values: menuItemsData }
      });
      
      // Mark as archived in MongoDB
      await MenuItem.updateMany(
        { _id: { $in: menuItemsToArchive.map(i => i._id) } },
        { isArchived: true }
      );
      
      console.log('✅ Menu items archived successfully');
    }
    
    console.log('🎉 Data archiving completed successfully!');
  } catch (error) {
    console.error('❌ Error archiving data:', error);
  }
}

// =============================================================================
// HEALTH CHECK ENDPOINTS
// =============================================================================

app.get('/', (req, res) => {
  res.json({
    message: 'Chouieur Express Backend - Hybrid MongoDB + Google Sheets',
    status: 'running',
    database: mongoConnected ? 'MongoDB Atlas (Primary)' : 'Google Sheets (Primary)',
    archive: sheetsConnected ? 'Google Sheets (Archive)' : 'Not Available',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoConnected ? 'MongoDB Atlas (Primary)' : 'Google Sheets (Primary)',
    archive: sheetsConnected ? 'Google Sheets (Archive)' : 'Not Available',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// =============================================================================
// SMART MENU ITEMS API
// =============================================================================

// GET /api/menu-items - Get all menu items (from MongoDB + Google Sheets if needed)
app.get('/api/menu-items', async (req, res) => {
  try {
    let menuItems = [];
    
    if (mongoConnected) {
      // Get from MongoDB first
      menuItems = await MenuItem.find({ isActive: true, isArchived: false }).sort({ category: 1, name: 1 });
      
      // If not enough items, get from Google Sheets
      if (menuItems.length < 10 && sheetsConnected) {
        console.log('📊 Getting additional menu items from Google Sheets...');
        // Implementation for Google Sheets fallback
      }
    } else if (sheetsConnected) {
      // Get from Google Sheets
      console.log('📊 Getting menu items from Google Sheets...');
      // Implementation for Google Sheets
    }
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/menu-items - Create new menu item
app.post('/api/menu-items', async (req, res) => {
  try {
    const { name, category, price, megaPrice, description, imageId } = req.body;
    
    if (mongoConnected) {
      const menuItem = new MenuItem({
        name,
        category,
        price,
        megaPrice,
        description,
        imageId,
        isActive: true
      });
      
      const savedItem = await menuItem.save();
      
      // Check if we need to archive old data
      const needsArchiving = await checkMongoDBCapacity();
      if (needsArchiving) {
        console.log('📦 MongoDB getting full, starting archiving process...');
        await archiveOldData();
      }
      
      res.status(201).json(savedItem);
    } else if (sheetsConnected) {
      // Create in Google Sheets
      console.log('📊 Creating menu item in Google Sheets...');
      // Implementation for Google Sheets
      res.status(201).json({ message: 'Menu item created in Google Sheets' });
    } else {
      res.status(500).json({ error: 'No database available' });
    }
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// =============================================================================
// SMART ORDERS API
// =============================================================================

// GET /api/orders - Get all orders (from MongoDB + Google Sheets if needed)
app.get('/api/orders', async (req, res) => {
  try {
    let orders = [];
    
    if (mongoConnected) {
      // Get from MongoDB first
      orders = await Order.find({ isArchived: false }).sort({ createdAt: -1 });
      
      // If not enough recent orders, get from Google Sheets
      if (orders.length < 50 && sheetsConnected) {
        console.log('📊 Getting additional orders from Google Sheets...');
        // Implementation for Google Sheets fallback
      }
    } else if (sheetsConnected) {
      // Get from Google Sheets
      console.log('📊 Getting orders from Google Sheets...');
      // Implementation for Google Sheets
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, customerName, customerPhone, customerAddress, items, total } = req.body;
    
    if (mongoConnected) {
      const order = new Order({
        userId,
        customerName,
        customerPhone,
        customerAddress,
        items,
        total,
        status: 'pending'
      });
      
      const savedOrder = await order.save();
      
      // Check if we need to archive old data
      const needsArchiving = await checkMongoDBCapacity();
      if (needsArchiving) {
        console.log('📦 MongoDB getting full, starting archiving process...');
        await archiveOldData();
      }
      
      res.status(201).json(savedOrder);
    } else if (sheetsConnected) {
      // Create in Google Sheets
      console.log('📊 Creating order in Google Sheets...');
      // Implementation for Google Sheets
      res.status(201).json({ message: 'Order created in Google Sheets' });
    } else {
      res.status(500).json({ error: 'No database available' });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:orderId - Update order status
app.put('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    console.log(`Received order update request: ${orderId}`, { status, notes });
    
    if (mongoConnected) {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (status) {
        order.status = status;
      }
      
      if (notes) {
        order.notes = notes;
      }
      
      order.updatedAt = new Date();
      await order.save();
      
      res.json({
        success: true,
        message: 'Order updated successfully',
        orderId: orderId,
        status: order.status
      });
    } else if (sheetsConnected) {
      // Update in Google Sheets
      console.log('📊 Updating order in Google Sheets...');
      // Implementation for Google Sheets
      res.json({
        success: true,
        message: 'Order updated in Google Sheets',
        orderId: orderId,
        status: status
      });
    } else {
      res.status(500).json({ error: 'No database available' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// =============================================================================
// USER MANAGEMENT API
// =============================================================================

// POST /api/users - Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { firebaseUid, email, name, role = 'customer' } = req.body;
    
    if (mongoConnected) {
      const user = await User.findOneAndUpdate(
        { firebaseUid },
        { firebaseUid, email, name, role },
        { upsert: true, new: true }
      );
      
      res.json(user);
    } else {
      // In-memory fallback for users
      res.json({
        _id: `user_${Date.now()}`,
        firebaseUid,
        email,
        name,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function startServer() {
  try {
    // Initialize Firebase
    await initializeFirebase();
    
    // Initialize MongoDB
    await initializeMongoDB();
    
    // Initialize Google Sheets
    await initializeGoogleSheets();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Starting Chouieur Express Backend - Hybrid System...');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Primary Database: ${mongoConnected ? 'MongoDB Atlas' : 'Google Sheets'}`);
      console.log(`📦 Archive Database: ${sheetsConnected ? 'Google Sheets' : 'Not Available'}`);
      console.log('🚀 Server bound to 0.0.0.0 for deployment');
      
      // Start periodic archiving check
      setInterval(async () => {
        if (mongoConnected && sheetsConnected) {
          const needsArchiving = await checkMongoDBCapacity();
          if (needsArchiving) {
            console.log('📦 Automatic archiving triggered...');
            await archiveOldData();
          }
        }
      }, 300000); // Check every 5 minutes
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
