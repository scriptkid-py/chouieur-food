/**
 * =============================================================================
 * MENU ITEM MODEL - GOOGLE SHEETS
 * =============================================================================
 * 
 * This file defines the MenuItem data access layer using Google Sheets.
 * It replaces the MongoDB MenuItem model with Google Sheets operations.
 */

const { getSheetData, appendToSheet, updateSheetRow, findRowByField } = require('../sheets');

const SHEET_NAME = 'MenuItems';

// =============================================================================
// MENU ITEM DATA OPERATIONS
// =============================================================================

/**
 * Get all menu items
 */
async function getAllMenuItems() {
  try {
    const data = await getSheetData(SHEET_NAME);
    return data.map(item => ({
      ...item,
      price: parseFloat(item.price) || 0,
      megaPrice: item.megaPrice ? parseFloat(item.megaPrice) : undefined,
      isActive: item.isActive === 'true' || item.isActive === true,
      _id: item.id,
    }));
  } catch (error) {
    console.error('Error getting all menu items:', error);
    throw error;
  }
}

/**
 * Get menu items by category
 */
async function getMenuItemsByCategory(category) {
  try {
    const allItems = await getAllMenuItems();
    return allItems.filter(item => item.category === category);
  } catch (error) {
    console.error('Error getting menu items by category:', error);
    throw error;
  }
}

/**
 * Get menu item by ID
 */
async function getMenuItemById(itemId) {
  try {
    const item = await findRowByField(SHEET_NAME, 'id', itemId);
    if (item) {
      return {
        ...item,
        price: parseFloat(item.price) || 0,
        megaPrice: item.megaPrice ? parseFloat(item.megaPrice) : undefined,
        isActive: item.isActive === 'true' || item.isActive === true,
        _id: item.id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting menu item by ID:', error);
    throw error;
  }
}

/**
 * Create a new menu item
 */
async function createMenuItem(itemData) {
  try {
    const item = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await appendToSheet(SHEET_NAME, item);
    return { ...item, _id: item.id };
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
}

/**
 * Update a menu item
 */
async function updateMenuItem(itemId, updateData) {
  try {
    const item = await getMenuItemById(itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }

    const updatedItem = {
      ...item,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Find the row number
    const allItems = await getSheetData(SHEET_NAME);
    const rowIndex = allItems.findIndex(i => i.id === itemId) + 2; // +2 for headers and 0-indexing

    if (rowIndex === 1) {
      throw new Error('Menu item not found in sheet');
    }

    await updateSheetRow(SHEET_NAME, rowIndex, updatedItem);
    return {
      ...updatedItem,
      _id: updatedItem.id,
    };
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
}

/**
 * Get active menu items only
 */
async function getActiveMenuItems() {
  try {
    const allItems = await getAllMenuItems();
    return allItems.filter(item => item.isActive);
  } catch (error) {
    console.error('Error getting active menu items:', error);
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  getAllMenuItems,
  getMenuItemsByCategory,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  getActiveMenuItems,
};
