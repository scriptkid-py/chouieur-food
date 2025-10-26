/**
 * =============================================================================
 * USER MODEL
 * =============================================================================
 * 
 * This file defines the User schema for MongoDB using Mongoose.
 * It stores user profiles and authentication information.
 */

const mongoose = require('mongoose');

// =============================================================================
// USER SCHEMA
// =============================================================================

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'kitchen', 'customer'],
    default: 'customer',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
    }],
    favoriteItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    }]
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Cameroon' }
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// =============================================================================
// VIRTUAL FIELDS
// =============================================================================

userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

userSchema.virtual('isKitchen').get(function() {
  return this.role === 'kitchen';
});

userSchema.virtual('isCustomer').get(function() {
  return this.role === 'customer';
});

// =============================================================================
// INSTANCE METHODS
// =============================================================================

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

userSchema.methods.addToOrderHistory = function(orderId) {
  if (!this.orderHistory.includes(orderId)) {
    this.orderHistory.push(orderId);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

userSchema.methods.updatePreferences = function(preferences) {
  this.preferences = { ...this.preferences, ...preferences };
  return this.save();
};

// =============================================================================
// STATIC METHODS
// =============================================================================

userSchema.statics.findByRole = function(role) {
  return this.find({ role: role, isActive: true }).sort({ name: 1 });
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

userSchema.statics.searchUsers = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        }
      }
    }
  ]);
};

// =============================================================================
// PRE-SAVE MIDDLEWARE
// =============================================================================

userSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Ensure name is properly formatted
  if (this.name) {
    this.name = this.name.trim();
  }
  
  next();
});

// =============================================================================
// POST-SAVE MIDDLEWARE
// =============================================================================

userSchema.post('save', function(doc) {
  console.log(`👤 User ${doc.email} saved with role: ${doc.role}`);
});

// =============================================================================
// EXPORT MODEL
// =============================================================================

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
