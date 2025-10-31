/**
 * =============================================================================
 * VERCEL SERVERLESS - MENU API WITH GOOGLE SHEETS
 * =============================================================================
 * 
 * Standalone Vercel serverless function for menu management using Google Sheets.
 * This file exports an Express app that can be deployed to Vercel.
 * 
 * ENDPOINTS:
 * ==========
 * GET    /api/menu              - Get all menu items
 * POST   /api/menu              - Add new menu item (admin)
 * PUT    /api/menu/:id          - Update menu item (admin)
 * DELETE /api/menu/:id          - Delete menu item (admin)
 * POST   /api/admin/login       - Admin login
 * GET    /api/health            - Health check
 * 
 * DEPLOYMENT:
 * ===========
 * 1. Set environment variables in Vercel dashboard
 * 2. Deploy to Vercel
 * 3. Configure vercel.json to route /api/* to this file
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./menu-sheets-api');

const app = express();

// =============================================================================
// MIDDLEWARE
// =============================================================================

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow Render and Vercel frontends
    const allowedOrigins = [
      'https://chouieur-express-frontend.onrender.com',
      'https://chouieur-express.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow any Render or Vercel URL
    if (origin.includes('onrender.com') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/api/health', (req, res) => {
  const hasGoogleSheets = !!(process.env.GOOGLE_SHEETS_ID && 
                               process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && 
                               process.env.GOOGLE_PRIVATE_KEY);
  
  res.json({
    status: 'OK',
    message: 'Menu API with Google Sheets is running',
    timestamp: new Date().toISOString(),
    googleSheets: {
      configured: hasGoogleSheets,
      sheetId: process.env.GOOGLE_SHEETS_ID ? 'Set' : 'Missing'
    }
  });
});

// =============================================================================
// ROUTES
// =============================================================================

// Mount menu routes
app.use('/api', menuRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Menu API with Google Sheets',
    endpoints: {
      health: '/api/health',
      menu: '/api/menu',
      adminLogin: '/api/admin/login'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Initialize Google Sheets connection
const { initGoogleSheets } = require('./services/google-sheets-service');
initGoogleSheets().then(() => {
  console.log('✅ Google Sheets initialized');
}).catch(err => {
  console.error('❌ Failed to initialize Google Sheets:', err.message);
});

// Export for Vercel
module.exports = app;

