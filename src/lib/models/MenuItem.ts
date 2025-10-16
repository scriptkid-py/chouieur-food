/**
 * =============================================================================
 * MENU ITEM MODEL
 * =============================================================================
 * 
 * This file defines the MenuItem schema for MongoDB using Mongoose.
 * It stores restaurant menu items and their details.
 * 
 * DATABASE CONFIGURATION:
 * =======================
 * The MongoDB connection is configured via the MONGO_URI environment variable.
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file or Render dashboard.
 */

import mongoose, { Document, Schema } from 'mongoose';

// =============================================================================
// MENU ITEM INTERFACE
// =============================================================================

export interface IMenuItem extends Document {
  name: string;
  category: 'Sandwiches' | 'Pizza' | 'Tacos' | 'Poulet' | 'Hamburgers' | 'Panini / Fajitas' | 'Plats';
  price: number;
  megaPrice?: number;
  description: string;
  imageId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// MENU ITEM SCHEMA
// =============================================================================

const MenuItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Sandwiches', 'Pizza', 'Tacos', 'Poulet', 'Hamburgers', 'Panini / Fajitas', 'Plats'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  megaPrice: {
    type: Number,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================

MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isActive: 1 });
MenuItemSchema.index({ category: 1, isActive: 1 });

// =============================================================================
// EXPORT MODEL
// =============================================================================

// Check if model already exists to avoid re-compilation errors
const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
