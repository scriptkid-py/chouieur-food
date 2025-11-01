/**
 * =============================================================================
 * SEED NAVIGATION ITEMS
 * =============================================================================
 * 
 * Script to seed initial navigation items into MongoDB
 * Run with: node scripts/seed-navigation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const NavigationItem = require('../api/models/NavigationItem');

const navigationItems = [
  // Public navigation items
  {
    id: 'home',
    label: 'Home',
    path: '/',
    requiresAuth: false,
    icon: 'Home',
    order: 1,
    visible: true,
    target: '_self',
    menuType: 'public',
    isActive: true,
  },
  {
    id: 'menu',
    label: 'Menu',
    path: '/menu',
    requiresAuth: false,
    icon: 'Utensils',
    order: 2,
    visible: true,
    target: '_self',
    menuType: 'public',
    isActive: true,
  },
  {
    id: 'about',
    label: 'About',
    path: '/about',
    requiresAuth: false,
    icon: 'Info',
    order: 3,
    visible: true,
    target: '_self',
    menuType: 'public',
    isActive: true,
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    requiresAuth: false,
    icon: 'Mail',
    order: 4,
    visible: true,
    target: '_self',
    menuType: 'public',
    isActive: true,
  },
  {
    id: 'delivery',
    label: 'Delivery',
    path: '/delivery',
    requiresAuth: false,
    icon: 'Truck',
    order: 5,
    visible: true,
    target: '_self',
    menuType: 'public',
    isActive: true,
  },
  // Admin navigation items
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    requiresAuth: true,
    icon: 'LayoutDashboard',
    order: 1,
    visible: true,
    target: '_self',
    menuType: 'admin',
    isActive: true,
  },
  {
    id: 'admin-menu',
    label: 'Menu Items',
    path: '/admin/menu',
    requiresAuth: true,
    icon: 'Utensils',
    order: 2,
    visible: true,
    target: '_self',
    menuType: 'admin',
    isActive: true,
  },
  {
    id: 'admin-orders',
    label: 'Orders',
    path: '/admin/orders',
    requiresAuth: true,
    icon: 'Package',
    order: 3,
    visible: true,
    target: '_self',
    menuType: 'admin',
    isActive: true,
  },
  {
    id: 'admin-navigation',
    label: 'Navigation',
    path: '/admin/navigation',
    requiresAuth: true,
    icon: 'Navigation',
    order: 4,
    visible: true,
    target: '_self',
    menuType: 'admin',
    isActive: true,
  },
];

async function seedNavigation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chouieur-express';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing navigation items
    await NavigationItem.deleteMany({});
    console.log('🗑️  Cleared existing navigation items');

    // Insert new navigation items
    const inserted = await NavigationItem.insertMany(navigationItems);
    console.log(`✅ Inserted ${inserted.length} navigation items`);

    // List inserted items
    inserted.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.menuType} - ${item.label} (${item.path})`);
    });

    console.log('\n✅ Navigation items seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding navigation items:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedNavigation();

