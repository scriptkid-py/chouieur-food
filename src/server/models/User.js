/**
 * =============================================================================
 * USER MODEL - GOOGLE SHEETS
 * =============================================================================
 * 
 * This file defines the User data access layer using Google Sheets.
 * It replaces the MongoDB User model with Google Sheets operations.
 */

const { getSheetData, appendToSheet, updateSheetRow, findRowByField } = require('../sheets');

const SHEET_NAME = 'Users';

// =============================================================================
// USER DATA OPERATIONS
// =============================================================================

/**
 * Get all users
 */
async function getAllUsers() {
  try {
    const data = await getSheetData(SHEET_NAME);
    return data.map(user => ({
      ...user,
      _id: user.id,
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Get user by Firebase UID
 */
async function getUserByFirebaseUid(firebaseUid) {
  try {
    const user = await findRowByField(SHEET_NAME, 'firebaseUid', firebaseUid);
    if (user) {
      return {
        ...user,
        _id: user.id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by Firebase UID:', error);
    throw error;
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    const user = await findRowByField(SHEET_NAME, 'email', email.toLowerCase());
    if (user) {
      return {
        ...user,
        _id: user.id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
async function createUser(userData) {
  try {
    const user = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await appendToSheet(SHEET_NAME, user);
    return { ...user, _id: user.id };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user
 */
async function updateUser(userId, updateData) {
  try {
    const user = await getUserByFirebaseUid(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...updateData,
      email: updateData.email ? updateData.email.toLowerCase() : user.email,
      updatedAt: new Date().toISOString(),
    };

    // Find the row number
    const allUsers = await getSheetData(SHEET_NAME);
    const rowIndex = allUsers.findIndex(u => u.id === user.id) + 2; // +2 for headers and 0-indexing

    if (rowIndex === 1) {
      throw new Error('User not found in sheet');
    }

    await updateSheetRow(SHEET_NAME, rowIndex, updatedUser);
    return {
      ...updatedUser,
      _id: updatedUser.id,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get users by role
 */
async function getUsersByRole(role) {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === role);
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
}

/**
 * Check if user exists by Firebase UID
 */
async function userExists(firebaseUid) {
  try {
    const user = await getUserByFirebaseUid(firebaseUid);
    return user !== null;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  getAllUsers,
  getUserByFirebaseUid,
  getUserByEmail,
  createUser,
  updateUser,
  getUsersByRole,
  userExists,
};
