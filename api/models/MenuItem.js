/**
 * =============================================================================
 * MENU ITEM MODEL
 * =============================================================================
 * 
 * This file defines the MenuItem schema for MongoDB using Mongoose.
 * It stores menu items with their details, pricing, and images.
 */

const mongoose = require('mongoose');

// =============================================================================
// MENU ITEM SCHEMA
// =============================================================================

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Pizza', 'Burgers', 'Hamburgers', 'Sandwiches', 'Tacos', 'Poulet', 'Panini / Fajitas', 'Plats', 'Salads', 'Appetizers', 'Beverages', 'Sides', 'Desserts'],
    default: 'Pizza'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  megaPrice: {
    type: Number,
    min: [0, 'Mega price cannot be negative'],
    default: null
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true,
    enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'fish', 'shellfish']
  }],
  preparationTime: {
    type: Number,
    min: [0, 'Preparation time cannot be negative'],
    default: 15 // minutes
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================

menuItemSchema.index({ name: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isActive: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ createdAt: -1 });

// =============================================================================
// VIRTUAL FIELDS
// =============================================================================

menuItemSchema.virtual('formattedPrice').get(function() {
  return `$${(this.price / 100).toFixed(2)}`;
});

menuItemSchema.virtual('formattedMegaPrice').get(function() {
  return this.megaPrice ? `$${(this.megaPrice / 100).toFixed(2)}` : null;
});

// =============================================================================
// INSTANCE METHODS
// =============================================================================

menuItemSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

menuItemSchema.methods.updatePrice = function(newPrice) {
  this.price = newPrice;
  return this.save();
};

// =============================================================================
// STATIC METHODS
// =============================================================================

menuItemSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, isActive: true }).sort({ name: 1 });
};

menuItemSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ category: 1, name: 1 });
};

menuItemSchema.statics.searchItems = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

// =============================================================================
// PRE-SAVE MIDDLEWARE
// =============================================================================

menuItemSchema.pre('save', function(next) {
  // Ensure megaPrice is not less than regular price
  if (this.megaPrice && this.megaPrice < this.price) {
    this.megaPrice = this.price;
  }
  
  // Convert price to cents if needed
  if (this.price < 100) {
    this.price = this.price * 100;
  }
  
  if (this.megaPrice && this.megaPrice < 100) {
    this.megaPrice = this.megaPrice * 100;
  }
  
  next();
});

// =============================================================================
// EXPORT MODEL
// =============================================================================

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
