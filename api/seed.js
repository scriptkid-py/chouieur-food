/**
 * =============================================================================
 * DATABASE SEED SCRIPT
 * =============================================================================
 * 
 * This script populates the MongoDB database with sample data for development
 * and testing purposes. Run this script after setting up MongoDB.
 * 
 * USAGE:
 * ======
 * node seed.js
 * 
 * REQUIREMENTS:
 * =============
 * - MongoDB running locally or accessible via MONGO_URI
 * - Environment variables set (MONGO_URI)
 */

require('dotenv').config();
const { connectToMongoDB, disconnectFromMongoDB } = require('./config/database');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleMenuItems = [
  {
    name: 'Pizza Margherita',
    category: 'Pizza',
    price: 5000, // 50.00 in cents
    megaPrice: 7000, // 70.00 in cents
    description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['tomato sauce', 'mozzarella', 'basil', 'olive oil'],
    preparationTime: 15,
    calories: 250,
    tags: ['vegetarian', 'classic', 'italian']
  },
  {
    name: 'Burger Deluxe',
    category: 'Burgers',
    price: 8000, // 80.00 in cents
    megaPrice: 10000, // 100.00 in cents
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['beef patty', 'lettuce', 'tomato', 'onion', 'special sauce', 'bun'],
    preparationTime: 12,
    calories: 450,
    tags: ['beef', 'classic', 'american']
  },
  {
    name: 'Chicken Wings',
    category: 'Appetizers',
    price: 4000, // 40.00 in cents
    description: 'Crispy chicken wings with your choice of sauce',
    imageUrl: 'https://images.unsplash.com/photo-1567620832904-9fe5cf23db13?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['chicken wings', 'flour', 'spices', 'sauce'],
    preparationTime: 20,
    calories: 300,
    tags: ['chicken', 'spicy', 'appetizer']
  },
  {
    name: 'Caesar Salad',
    category: 'Salads',
    price: 3500, // 35.00 in cents
    description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['romaine lettuce', 'caesar dressing', 'croutons', 'parmesan'],
    preparationTime: 8,
    calories: 200,
    tags: ['healthy', 'vegetarian', 'fresh']
  },
  {
    name: 'Coca Cola',
    category: 'Beverages',
    price: 1000, // 10.00 in cents
    description: 'Refreshing cola drink',
    imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['carbonated water', 'sugar', 'caramel color', 'natural flavors'],
    preparationTime: 1,
    calories: 140,
    tags: ['soda', 'refreshing', 'classic']
  },
  {
    name: 'French Fries',
    category: 'Sides',
    price: 2500, // 25.00 in cents
    description: 'Crispy golden french fries',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['potatoes', 'oil', 'salt'],
    preparationTime: 10,
    calories: 320,
    tags: ['potato', 'crispy', 'side']
  }
];

const sampleOrders = [
  {
    orderId: 'ORD-' + Date.now() + '-001',
    customerName: 'John Doe',
    customerPhone: '+237123456789',
    customerAddress: '123 Main St, Douala',
    customerEmail: 'john@example.com',
    items: [
      {
        name: 'Pizza Margherita',
        quantity: 2,
        price: 5000,
        totalPrice: 10000,
        size: 'regular'
      },
      {
        name: 'Coca Cola',
        quantity: 1,
        price: 1000,
        totalPrice: 1000,
        size: 'regular'
      }
    ],
    subtotal: 11000,
    total: 11000,
    status: 'pending',
    orderType: 'delivery',
    paymentMethod: 'cash',
    notes: 'Please ring the doorbell twice'
  },
  {
    orderId: 'ORD-' + Date.now() + '-002',
    customerName: 'Jane Smith',
    customerPhone: '+237987654321',
    customerAddress: '456 Oak Ave, Yaounde',
    customerEmail: 'jane@example.com',
    items: [
      {
        name: 'Burger Deluxe',
        quantity: 1,
        price: 8000,
        totalPrice: 8000,
        size: 'mega'
      }
    ],
    subtotal: 10000,
    total: 10000,
    status: 'confirmed',
    orderType: 'delivery',
    paymentMethod: 'card',
    notes: 'Extra cheese please'
  }
];

const sampleUsers = [
  {
    email: 'admin@chouieur.com',
    name: 'Admin User',
    phone: '+237111111111',
    role: 'admin',
    isActive: true
  },
  {
    email: 'kitchen@chouieur.com',
    name: 'Kitchen Staff',
    phone: '+237222222222',
    role: 'kitchen',
    isActive: true
  },
  {
    email: 'customer@example.com',
    name: 'Test Customer',
    phone: '+237333333333',
    role: 'customer',
    isActive: true
  }
];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});
    
    // Seed menu items
    console.log('📋 Seeding menu items...');
    const menuItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`✅ Created ${menuItems.length} menu items`);
    
    // Seed orders
    console.log('📦 Seeding orders...');
    const orders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${orders.length} orders`);
    
    // Seed users
    console.log('👥 Seeding users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Menu Items: ${menuItems.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Users: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnectFromMongoDB();
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
