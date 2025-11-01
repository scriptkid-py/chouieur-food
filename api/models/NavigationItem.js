/**
 * =============================================================================
 * NAVIGATION ITEM MODEL
 * =============================================================================
 * 
 * This file defines the NavigationItem schema for MongoDB using Mongoose.
 * It stores navigation menu items with their paths, visibility, and permissions.
 */

const mongoose = require('mongoose');

// =============================================================================
// NAVIGATION ITEM SCHEMA
// =============================================================================

const navigationItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Navigation item ID is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
    maxlength: [100, 'Label cannot exceed 100 characters']
  },
  path: {
    type: String,
    required: [true, 'Path is required'],
    trim: true
  },
  requiresAuth: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  visible: {
    type: Boolean,
    default: true
  },
  target: {
    type: String,
    enum: ['_blank', '_self'],
    default: '_self'
  },
  onClick: {
    type: String,
    trim: true,
    default: ''
  },
  menuType: {
    type: String,
    enum: ['public', 'admin'],
    required: [true, 'Menu type is required'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
navigationItemSchema.index({ menuType: 1, visible: 1, order: 1 });
navigationItemSchema.index({ id: 1 });

module.exports = mongoose.model('NavigationItem', navigationItemSchema);

