/**
 * =============================================================================
 * ORDER MODEL
 * =============================================================================
 * 
 * This file defines the Order schema for MongoDB using Mongoose.
 * It stores customer orders and their details.
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
// ORDER ITEM INTERFACE
// =============================================================================

export interface IOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  size: 'Normal' | 'Mega';
  unitPrice: number;
  totalPrice: number;
  supplements: {
    id: string;
    name: string;
    price: number;
  }[];
}

// =============================================================================
// ORDER INTERFACE
// =============================================================================

export interface IOrder extends Document {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// ORDER ITEM SCHEMA
// =============================================================================

const OrderItemSchema: Schema = new Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: String,
    enum: ['Normal', 'Mega'],
    default: 'Normal',
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  supplements: [{
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
}, { _id: false });

// =============================================================================
# ORDER SCHEMA
// =============================================================================

const OrderSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  customerAddress: {
    type: String,
    required: true,
    trim: true,
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item',
    },
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'delivered'],
    default: 'pending',
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================

OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

// =============================================================================
// EXPORT MODEL
// =============================================================================

// Check if model already exists to avoid re-compilation errors
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
