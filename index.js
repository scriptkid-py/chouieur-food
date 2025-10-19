const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

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
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Google Sheets authentication
let sheets;
let auth;

async function initializeGoogleSheets() {
  try {
    if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.log('⚠️  Google Sheets credentials not configured, running without Sheets integration');
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

    console.log('✅ Google Sheets authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets authentication failed:', error.message);
    console.log('⚠️  Running without Google Sheets integration');
    return false;
  }
}

// Root endpoint for Render health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      testSheets: '/api/test-sheets',
      data: '/api/data'
    }
  });
});

// Simple ping endpoint for Render
app.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

// ==================== USER MANAGEMENT ENDPOINTS ====================

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const user = req.body;
    
    // Check if user already exists
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A1:H1000',
    });

    const existingValues = existingResponse.data.values || [];
    const headers = existingValues[0] || [];
    const existingUsers = existingValues.slice(1);

    // Find existing user by Firebase UID
    let existingUserIndex = -1;
    if (headers.includes('FirebaseUID')) {
      const uidIndex = headers.indexOf('FirebaseUID');
      existingUserIndex = existingUsers.findIndex(row => row[uidIndex] === user.uid);
    }

    // Prepare user data for Google Sheets
    const userData = [
      user.uid || '',                    // FirebaseUID
      user.email || '',                  // Email
      user.displayName || '',            // DisplayName
      user.phoneNumber || '',            // PhoneNumber
      user.photoURL || '',               // PhotoURL
      new Date().toISOString(),          // CreatedAt
      new Date().toISOString(),          // UpdatedAt
      user.role || 'customer'            // Role (customer, admin, staff)
    ];

    if (existingUserIndex >= 0) {
      // Update existing user
      const rowNumber = existingUserIndex + 2; // +2 because of header row and 0-based index
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `Users!A${rowNumber}:H${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [userData]
        }
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        user: {
          ...user,
          id: user.uid
        }
      });
    } else {
      // Create new user
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'Users!A:H',
        valueInputOption: 'RAW',
        resource: {
          values: [userData]
        }
      });

      res.json({
        success: true,
        message: 'User created successfully',
        user: {
          ...user,
          id: user.uid
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({
      error: 'Failed to create/update user',
      message: error.message
    });
  }
});

// Get user by Firebase UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { uid } = req.params;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A1:H1000',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const headers = values[0];
    const users = values.slice(1);

    // Find user by Firebase UID
    const uidIndex = headers.indexOf('FirebaseUID');
    if (uidIndex === -1) {
      return res.status(500).json({
        error: 'FirebaseUID column not found'
      });
    }

    const userRow = users.find(row => row[uidIndex] === uid);
    if (!userRow) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Convert row to user object
    const user = {};
    headers.forEach((header, index) => {
      user[header.toLowerCase().replace(/\s+/g, '_')] = userRow[index] || '';
    });

    res.json({
      success: true,
      user: {
        ...user,
        id: user.firebaseuid
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A1:H1000',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.json([]);
    }

    const headers = values[0];
    const users = values.slice(1).map((row, index) => {
      const user = {};
      headers.forEach((header, colIndex) => {
        user[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
      });
      user.id = user.firebaseuid || (index + 1).toString();
      return user;
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Update user role (admin only)
app.put('/api/users/:uid/role', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { uid } = req.params;
    const { role } = req.body;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A1:H1000',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const headers = values[0];
    const users = values.slice(1);

    // Find user by Firebase UID
    const uidIndex = headers.indexOf('FirebaseUID');
    const roleIndex = headers.indexOf('Role');
    const updatedAtIndex = headers.indexOf('UpdatedAt');

    if (uidIndex === -1 || roleIndex === -1) {
      return res.status(500).json({
        error: 'Required columns not found'
      });
    }

    const userRowIndex = users.findIndex(row => row[uidIndex] === uid);
    if (userRowIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update user role
    const rowNumber = userRowIndex + 2; // +2 because of header row and 0-based index
    
    // Update role column
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `Users!${String.fromCharCode(65 + roleIndex)}${rowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[role]]
      }
    });

    // Update UpdatedAt column if it exists
    if (updatedAtIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `Users!${String.fromCharCode(65 + updatedAtIndex)}${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[new Date().toISOString()]]
        }
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: error.message
    });
  }
});

// Fix Users sheet headers endpoint
app.post('/api/fix-users-headers', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    // Set up proper headers for Users sheet
    const headers = [
      'FirebaseUID',    // A - Firebase User ID
      'Email',          // B - User email
      'DisplayName',    // C - User display name
      'PhoneNumber',    // D - User phone number
      'PhotoURL',       // E - User profile photo URL
      'CreatedAt',      // F - Account creation timestamp
      'UpdatedAt',      // G - Last update timestamp
      'Role'            // H - User role (customer, admin, staff)
    ];

    // Clear existing data and add headers
    await sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A1:H1',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A1:H1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });

    res.json({
      success: true,
      message: 'Users sheet headers fixed successfully',
      headers: headers
    });
  } catch (error) {
    console.error('Error fixing Users sheet headers:', error);
    res.status(500).json({
      error: 'Failed to fix Users sheet headers',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend with Google Sheets is running',
    timestamp: new Date().toISOString(),
    sheetsConfigured: !!sheets
  });
});

// Test Google Sheets connection
app.get('/api/test-sheets', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        success: false,
        message: 'Google Sheets not initialized. Check your environment variables and service account permissions.',
        troubleshooting: {
          steps: [
            '1. Verify GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set',
            '2. Enable Google Sheets API in Google Cloud Console',
            '3. Share your Google Sheet with the service account email',
            '4. Check that the private key is properly formatted'
          ]
        }
      });
    }

    // Test read access
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'A1:E5',
    });

    const values = response.data.values || [];
    
    res.json({
      success: true,
      message: 'Google Sheets connection successful',
      data: values,
      rowCount: values.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google Sheets connection failed',
      error: error.message,
      troubleshooting: {
        commonIssues: [
          'Private key format issue - ensure proper line breaks',
          'Google Sheets API not enabled',
          'Service account lacks permissions',
          'Sheet not shared with service account'
        ]
      }
    });
  }
});

// GET /data - Read data from Google Sheets
app.get('/api/data', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { range = 'A1:Z100' } = req.query;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: range,
    });

    const values = response.data.values || [];
    
    // Convert to objects if there are headers
    let data = values;
    if (values.length > 0) {
      const headers = values[0];
      data = values.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    }

    res.json({
      success: true,
      data: data,
      totalRows: values.length
    });
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to read data from Google Sheets',
      message: error.message
    });
  }
});

// POST /data - Add new row to Google Sheets
app.post('/api/data', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { data, range = 'A:Z' } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Data must be an array'
      });
    }

    // Append data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [data]
      }
    });

    res.json({
      success: true,
      message: 'Data added successfully',
      updatedRows: response.data.updates?.updatedRows || 1
    });
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to write data to Google Sheets',
      message: error.message
    });
  }
});

// Menu items endpoints
app.get('/api/menu-items', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    // Read from MenuItems sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:H100',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.json([]);
    }

    const headers = values[0];
    const menuItems = values.slice(1).map((row, index) => {
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

// ==================== IMAGE UPLOAD ENDPOINTS ====================

// Upload menu item image
app.post('/api/menu-items/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/menu-images/${req.file.filename}`;
    const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: fullImageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

// Create new menu item with image
app.post('/api/menu-items', upload.single('image'), async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { name, category, price, megaPrice, description, imageId } = req.body;
    
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        error: 'Missing required fields: name, category, price, description'
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/menu-images/${req.file.filename}`;
    } else if (imageId) {
      // Use existing imageId if no new image uploaded
      imageUrl = imageId;
    }

    // Prepare menu item data for Google Sheets
    const menuItemData = [
      uuidv4(), // ID
      name,
      category,
      parseFloat(price),
      megaPrice ? parseFloat(megaPrice) : '',
      description,
      imageUrl || imageId || '',
      'TRUE' // IsActive
    ];

    // Add menu item to MenuItems sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A:H',
      valueInputOption: 'RAW',
      resource: {
        values: [menuItemData]
      }
    });

    res.json({
      success: true,
      message: 'Menu item created successfully',
      menuItem: {
        id: menuItemData[0],
        name,
        category,
        price: parseFloat(price),
        megaPrice: megaPrice ? parseFloat(megaPrice) : undefined,
        description,
        imageUrl: imageUrl || imageId || '',
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      error: 'Failed to create menu item',
      message: error.message
    });
  }
});

// Update menu item with image
app.put('/api/menu-items/:id', upload.single('image'), async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { id } = req.params;
    const { name, category, price, megaPrice, description, imageId } = req.body;

    // Find the menu item row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:H1000',
    });

    const values = response.data.values || [];
    const menuItemRowIndex = values.findIndex(row => row[0] === id);

    if (menuItemRowIndex === -1) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/menu-images/${req.file.filename}`;
    } else if (imageId) {
      imageUrl = imageId;
    } else {
      // Keep existing image if no new one provided
      imageUrl = values[menuItemRowIndex][6] || '';
    }

    // Update the menu item
    const rowNumber = menuItemRowIndex + 1;
    const updates = [];

    if (name) {
      updates.push({
        range: `MenuItems!B${rowNumber}`,
        values: [[name]]
      });
    }
    
    if (category) {
      updates.push({
        range: `MenuItems!C${rowNumber}`,
        values: [[category]]
      });
    }
    
    if (price) {
      updates.push({
        range: `MenuItems!D${rowNumber}`,
        values: [[parseFloat(price)]]
      });
    }
    
    if (megaPrice !== undefined) {
      updates.push({
        range: `MenuItems!E${rowNumber}`,
        values: [[megaPrice ? parseFloat(megaPrice) : '']]
      });
    }
    
    if (description) {
      updates.push({
        range: `MenuItems!F${rowNumber}`,
        values: [[description]]
      });
    }
    
    if (imageUrl) {
      updates.push({
        range: `MenuItems!G${rowNumber}`,
        values: [[imageUrl]]
      });
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem: {
        id,
        name: name || values[menuItemRowIndex][1],
        category: category || values[menuItemRowIndex][2],
        price: price ? parseFloat(price) : parseFloat(values[menuItemRowIndex][3]),
        megaPrice: megaPrice ? parseFloat(megaPrice) : (values[menuItemRowIndex][4] ? parseFloat(values[menuItemRowIndex][4]) : undefined),
        description: description || values[menuItemRowIndex][5],
        imageUrl: imageUrl || values[menuItemRowIndex][6],
        isActive: values[menuItemRowIndex][7] === 'TRUE'
      }
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      error: 'Failed to update menu item',
      message: error.message
    });
  }
});

// Delete menu item image
app.delete('/api/menu-items/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const imagePath = path.join(UPLOADS_DIR, id);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message
    });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1000',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.json([]);
    }

    const headers = values[0];
    const orders = values.slice(1).map((row, index) => {
      const order = {};
      headers.forEach((header, colIndex) => {
        order[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
      });
      order.id = order.orderid || (index + 1).toString();
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

app.post('/api/orders', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const order = req.body;
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare order data for Google Sheets
    const orderData = [
      orderId,
      order.userId || '',
      order.customerName || 'Anonymous',
      order.customerPhone || '',
      order.customerAddress || '',
      JSON.stringify(order.items || []),
      order.total || 0,
      order.status || 'pending',
      new Date().toISOString(),
      new Date().toISOString(),
      order.email || '',
      order.notes || '',
      order.deliveryTime || '',
      order.paymentMethod || 'cash',
      order.orderType || 'delivery'
    ];

    // Add order to Orders sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A:O',
      valueInputOption: 'RAW',
      resource: {
        values: [orderData]
      }
    });

    // Add individual order items to OrderItems sheet
    if (order.items && order.items.length > 0) {
      const orderItemsData = order.items.map(item => [
        orderId,
        item.menuItemId || item.menuItem?.id || '',
        item.menuItem?.name || item.name || '',
        item.quantity || 1,
        item.size || 'Normal',
        item.unitPrice || item.menuItem?.price || 0,
        item.totalPrice || 0,
        JSON.stringify(item.supplements || []),
        new Date().toISOString(),
        item.notes || ''
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'OrderItems!A:J',
        valueInputOption: 'RAW',
        resource: {
          values: orderItemsData
        }
      });
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: orderId,
      order: {
        ...order,
        id: orderId
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// Get orders by user ID
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { userId } = req.params;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1000',
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      return res.json([]);
    }

    const headers = values[0];
    const allOrders = values.slice(1).map((row, index) => {
      const order = {};
      headers.forEach((header, colIndex) => {
        order[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
      });
      order.id = order.orderid || (index + 1).toString();
      return order;
    });

    // Filter orders by user ID
    const userOrders = allOrders.filter(order => order.userid === userId);

    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      error: 'Failed to fetch user orders',
      message: error.message
    });
  }
});

// Update order status
app.put('/api/orders/:orderId', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    const { orderId } = req.params;
    const { status, notes } = req.body;

    // Find the order row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1000',
    });

    const values = response.data.values || [];
    const orderRowIndex = values.findIndex(row => row[0] === orderId);

    if (orderRowIndex === -1) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Update the order status
    const rowNumber = orderRowIndex + 1;
    const updates = [];
    
    if (status) {
      updates.push({
        range: `Orders!H${rowNumber}`,
        values: [[status]]
      });
    }
    
    if (notes) {
      updates.push({
        range: `Orders!L${rowNumber}`,
        values: [[notes]]
      });
    }

    // Update timestamp
    updates.push({
      range: `Orders!J${rowNumber}`,
      values: [[new Date().toISOString()]]
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: GOOGLE_SHEETS_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      error: 'Failed to update order',
      message: error.message
    });
  }
});

// Admin statistics endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets not initialized'
      });
    }

    // Fetch orders data
    const ordersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Orders!A1:O1000',
    });

    // Fetch menu items data
    const menuResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:I1000',
    });

    const ordersValues = ordersResponse.data.values || [];
    const menuValues = menuResponse.data.values || [];

    // Process orders
    let totalOrders = 0;
    let pendingOrders = 0;
    let confirmedOrders = 0;
    let readyOrders = 0;
    let deliveredOrders = 0;
    let totalRevenue = 0;
    const recentOrders = [];

    if (ordersValues.length > 1) {
      const orderHeaders = ordersValues[0];
      const orders = ordersValues.slice(1);

      totalOrders = orders.length;

      orders.forEach((row, index) => {
        const order = {};
        orderHeaders.forEach((header, colIndex) => {
          order[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
        });

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
            id: order.orderid || `ORD-${index + 1}`,
            customer: order.customer_name || 'Anonymous',
            total: total,
            status: status || 'pending',
            time: order.created_at || new Date().toISOString(),
            items: order.items ? JSON.parse(order.items) : []
          });
        }
      });
    }

    // Process menu items
    let totalMenuItems = 0;
    let activeMenuItems = 0;
    let menuItemsWithImages = 0;
    const categories = new Set();

    if (menuValues.length > 1) {
      const menuHeaders = menuValues[0];
      const menuItems = menuValues.slice(1);

      totalMenuItems = menuItems.length;

      menuItems.forEach(row => {
        const item = {};
        menuHeaders.forEach((header, colIndex) => {
          item[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
        });

        // Count active items
        if (item.isactive !== 'FALSE' && item.isactive !== false) {
          activeMenuItems++;
        }

        // Count items with images
        if (item.imageurl && item.imageurl.trim() !== '') {
          menuItemsWithImages++;
        }

        // Count categories
        if (item.category) {
          categories.add(item.category);
        }
      });
    }

    // Calculate growth (mock data for now - you can implement real growth calculation)
    const stats = {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        ready: readyOrders,
        delivered: deliveredOrders,
        growth: totalOrders > 0 ? Math.round((totalOrders / 30) * 100) / 100 : 0 // Mock growth
      },
      revenue: {
        total: totalRevenue,
        growth: totalRevenue > 0 ? Math.round((totalRevenue / 30) * 100) / 100 : 0 // Mock growth
      },
      menu: {
        total: totalMenuItems,
        active: activeMenuItems,
        withImages: menuItemsWithImages,
        categories: categories.size
      },
      recentOrders: recentOrders
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      error: 'Failed to fetch admin statistics',
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

// Initialize Google Sheets and start server
async function startServer() {
  console.log('🚀 Starting Chouieur Express Backend...');
  
  const sheetsInitialized = await initializeGoogleSheets();
  
  if (!sheetsInitialized) {
    console.log('⚠️  Warning: Google Sheets not initialized. Some endpoints will not work.');
    console.log('📋 Make sure to set the following environment variables:');
    console.log('   - GOOGLE_SHEETS_ID');
    console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('   - GOOGLE_PRIVATE_KEY');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Sheets test: http://localhost:${PORT}/api/test-sheets`);
    console.log(`📋 Sheets ID: ${GOOGLE_SHEETS_ID || 'Not configured'}`);
    console.log(`🚀 Server bound to 0.0.0.0:${PORT} for Render deployment`);
  });
}

startServer().catch(console.error);

module.exports = app;
