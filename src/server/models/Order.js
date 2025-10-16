/**
 * =============================================================================
 * ORDER MODEL - GOOGLE SHEETS
 * =============================================================================
 * 
 * This file defines the Order data access layer using Google Sheets.
 * It replaces the MongoDB Order model with Google Sheets operations.
 */

const { getSheetData, appendToSheet, updateSheetRow, findRowByField, getNextRowNumber } = require('../sheets');

const SHEET_NAME = 'Orders';

// =============================================================================
// ORDER DATA OPERATIONS
// =============================================================================

/**
 * Create a new order
 */
async function createOrder(orderData) {
  try {
    // Add timestamp
    const order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Convert items array to string for storage
    order.items = JSON.stringify(order.items);

    const result = await appendToSheet(SHEET_NAME, order);
    return { ...order, _id: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get all orders
 */
async function getAllOrders() {
  try {
    const data = await getSheetData(SHEET_NAME);
    return data.map(order => ({
      ...order,
      items: JSON.parse(order.items || '[]'),
      _id: order.id,
    }));
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}

/**
 * Get orders by user ID
 */
async function getOrdersByUserId(userId) {
  try {
    const allOrders = await getAllOrders();
    return allOrders.filter(order => order.userId === userId);
  } catch (error) {
    console.error('Error getting orders by user ID:', error);
    throw error;
  }
}

/**
 * Get order by ID
 */
async function getOrderById(orderId) {
  try {
    const order = await findRowByField(SHEET_NAME, 'id', orderId);
    if (order) {
      return {
        ...order,
        items: JSON.parse(order.items || '[]'),
        _id: order.id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, status) {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };

    // Convert items back to string for storage
    updatedOrder.items = JSON.stringify(updatedOrder.items);

    // Find the row number (this is a simplified approach)
    const allOrders = await getSheetData(SHEET_NAME);
    const rowIndex = allOrders.findIndex(o => o.id === orderId) + 2; // +2 for headers and 0-indexing

    if (rowIndex === 1) {
      throw new Error('Order not found in sheet');
    }

    await updateSheetRow(SHEET_NAME, rowIndex, updatedOrder);
    return {
      ...updatedOrder,
      items: JSON.parse(updatedOrder.items),
      _id: updatedOrder.id,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Delete order
 */
async function deleteOrder(orderId) {
  try {
    // Note: Google Sheets doesn't have a direct delete operation via API
    // This would require implementing a "soft delete" by marking as deleted
    // or using batch update to clear the row
    console.warn('Delete operation not implemented for Google Sheets');
    return { success: true, message: 'Delete not implemented' };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
