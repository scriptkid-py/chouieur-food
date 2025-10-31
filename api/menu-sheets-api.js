/**
 * =============================================================================
 * MENU API - GOOGLE SHEETS ONLY
 * =============================================================================
 * 
 * Simple API endpoints for menu management using Google Sheets as the database.
 * 
 * ENDPOINTS:
 * ==========
 * GET    /api/menu              - Get all menu items from Google Sheets
 * POST   /api/menu              - Add new menu item (admin only)
 * PUT    /api/menu/:id          - Update menu item (admin only)
 * DELETE /api/menu/:id          - Delete menu item (admin only)
 * POST   /api/admin/login       - Admin login
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * ===============================
 * GOOGLE_SHEETS_ID              - Your Google Sheet ID
 * GOOGLE_SERVICE_ACCOUNT_EMAIL  - Service account email
 * GOOGLE_PRIVATE_KEY            - Service account private key
 * ADMIN_PASSWORD                - Password for admin access
 */

const express = require('express');
const cors = require('cors');
const { 
  initGoogleSheets, 
  listMenuItems, 
  getMenuItemById,
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require('./services/google-sheets-service');

const router = express.Router();

// =============================================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =============================================================================

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Admin authentication required. Please login first.'
    });
  }

  // Simple token check - token should be the admin password
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Admin password not configured'
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

// =============================================================================
// ADMIN LOGIN ENDPOINT
// =============================================================================

router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Missing password',
        message: 'Password is required'
      });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        message: 'Admin password not configured'
      });
    }

    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Incorrect password'
      });
    }

    // Return token (which is the password itself for simplicity)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: adminPassword, // In production, use JWT
      expiresIn: '24h'
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
// MENU ENDPOINTS
// =============================================================================

// GET /api/menu - Get all menu items (public)
router.get('/menu', async (req, res) => {
  try {
    console.log('📋 Fetching menu items from Google Sheets...');
    
    const items = await listMenuItems();
    
    if (items === null) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to connect to Google Sheets. Please check configuration.'
      });
    }

    // Filter by category if provided
    const { category } = req.query;
    let filteredItems = items;
    if (category) {
      filteredItems = items.filter(item => item.category === category);
    }

    // Filter active items only
    filteredItems = filteredItems.filter(item => item.isActive !== false);

    res.status(200).json({
      success: true,
      data: filteredItems,
      source: 'google-sheets',
      message: `Successfully fetched ${filteredItems.length} menu items`,
      count: filteredItems.length
    });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
});

// GET /api/menu/:id - Get single menu item (public)
router.get('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getMenuItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }

    res.status(200).json({
      success: true,
      data: item,
      source: 'google-sheets'
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

// POST /api/menu - Create new menu item (admin only)
router.post('/menu', authenticateAdmin, async (req, res) => {
  try {
    console.log('📝 Creating new menu item in Google Sheets...');
    
    const { name, price, category, description, imageUrl, megaPrice, isActive } = req.body;

    // Validation
    if (!name || price == null) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Name and price are required'
      });
    }

    // Generate unique ID
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare menu item
    const menuItem = {
      id,
      name: String(name),
      category: String(category || 'Other'),
      price: parseFloat(price),
      megaPrice: megaPrice ? parseFloat(megaPrice) : undefined,
      description: String(description || ''),
      imageUrl: String(imageUrl || ''),
      imageId: '', // Can be used for Cloudinary or other image services
      isActive: isActive !== false
    };

    // Create in Google Sheets
    const createdItem = await createMenuItem(menuItem);

    if (!createdItem) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to create menu item. Please check Google Sheets configuration.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: createdItem,
      source: 'google-sheets'
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

// PUT /api/menu/:id - Update menu item (admin only)
router.put('/menu/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if item exists
    const existingItem = await getMenuItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }

    // Prepare update data
    const updateData = {};
    if (updates.name !== undefined) updateData.name = String(updates.name);
    if (updates.category !== undefined) updateData.category = String(updates.category);
    if (updates.price !== undefined) updateData.price = parseFloat(updates.price);
    if (updates.megaPrice !== undefined) updateData.megaPrice = updates.megaPrice ? parseFloat(updates.megaPrice) : undefined;
    if (updates.description !== undefined) updateData.description = String(updates.description);
    if (updates.imageUrl !== undefined) updateData.imageUrl = String(updates.imageUrl);
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive !== false;

    // Update in Google Sheets
    const updatedItem = await updateMenuItem(id, updateData);

    if (!updatedItem) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to update menu item. Please check Google Sheets configuration.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem,
      source: 'google-sheets'
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

// DELETE /api/menu/:id - Delete menu item (admin only)
router.delete('/menu/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await getMenuItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }

    // Delete from Google Sheets
    const deleted = await deleteMenuItem(id);

    if (!deleted) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to delete menu item. Please check Google Sheets configuration.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: { id }
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

// Also support /menu-items endpoints for frontend compatibility (duplicate routes)
// Helper function to create menu item (reusable)
const handleGetMenu = async (req, res) => {
  try {
    console.log('📋 Fetching menu items from Google Sheets...');
    const items = await listMenuItems();
    if (items === null) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to connect to Google Sheets. Please check configuration.'
      });
    }
    const { category } = req.query;
    let filteredItems = items;
    if (category) {
      filteredItems = items.filter(item => item.category === category);
    }
    filteredItems = filteredItems.filter(item => item.isActive !== false);
    res.status(200).json({
      success: true,
      data: filteredItems,
      source: 'google-sheets',
      message: `Successfully fetched ${filteredItems.length} menu items`,
      count: filteredItems.length
    });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
};

// GET /api/menu-items - Alternative endpoint for frontend compatibility
router.get('/menu-items', handleGetMenu);

// GET /api/menu-items/:id - Get single menu item (alternative endpoint)
router.get('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getMenuItemById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    res.status(200).json({
      success: true,
      data: item,
      source: 'google-sheets'
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

// POST /api/menu-items - Create menu item (alternative endpoint)
router.post('/menu-items', authenticateAdmin, async (req, res) => {
  try {
    console.log('📝 Creating new menu item in Google Sheets...');
    const { name, price, category, description, imageUrl, megaPrice, isActive } = req.body;
    if (!name || price == null) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Name and price are required'
      });
    }
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const menuItem = {
      id,
      name: String(name),
      category: String(category || 'Other'),
      price: parseFloat(price),
      megaPrice: megaPrice ? parseFloat(megaPrice) : undefined,
      description: String(description || ''),
      imageUrl: String(imageUrl || ''),
      imageId: '',
      isActive: isActive !== false
    };
    const createdItem = await createMenuItem(menuItem);
    if (!createdItem) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to create menu item. Please check Google Sheets configuration.'
      });
    }
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: createdItem,
      source: 'google-sheets'
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

// PUT /api/menu-items/:id - Update menu item (alternative endpoint)
router.put('/menu-items/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const existingItem = await getMenuItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    const updateData = {};
    if (updates.name !== undefined) updateData.name = String(updates.name);
    if (updates.category !== undefined) updateData.category = String(updates.category);
    if (updates.price !== undefined) updateData.price = parseFloat(updates.price);
    if (updates.megaPrice !== undefined) updateData.megaPrice = updates.megaPrice ? parseFloat(updates.megaPrice) : undefined;
    if (updates.description !== undefined) updateData.description = String(updates.description);
    if (updates.imageUrl !== undefined) updateData.imageUrl = String(updates.imageUrl);
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive !== false;
    const updatedItem = await updateMenuItem(id, updateData);
    if (!updatedItem) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to update menu item. Please check Google Sheets configuration.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem,
      source: 'google-sheets'
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

// DELETE /api/menu-items/:id - Delete menu item (alternative endpoint)
router.delete('/menu-items/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existingItem = await getMenuItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    const deleted = await deleteMenuItem(id);
    if (!deleted) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not available',
        message: 'Unable to delete menu item. Please check Google Sheets configuration.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: { id }
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

module.exports = router;

