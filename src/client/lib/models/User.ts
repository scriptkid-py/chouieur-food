/**
 * =============================================================================
 * USER MODEL
 * =============================================================================
 * 
 * This file defines the User schema for MongoDB using Mongoose.
 * It stores user profiles and authentication information.
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
// USER INTERFACE
// =============================================================================

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  role: 'admin' | 'kitchen' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// USER SCHEMA
// =============================================================================

const UserSchema: Schema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'kitchen', 'customer'],
    default: 'customer',
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================

UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// =============================================================================
// EXPORT MODEL
// =============================================================================

// Check if model already exists to avoid re-compilation errors
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
