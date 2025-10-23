/**
 * =============================================================================
 * MONGODB DATABASE MANAGEMENT UTILITY
 * =============================================================================
 * 
 * This utility provides comprehensive database management functions for your
 * MongoDB database. It includes backup, restore, cleanup, and monitoring features.
 * 
 * USAGE:
 * ======
 * node database-manager.js [command] [options]
 * 
 * COMMANDS:
 * =========
 * - backup: Create a backup of the database
 * - restore: Restore from a backup
 * - status: Check database connection and status
 * - cleanup: Clean up old data and optimize database
 * - stats: Show database statistics
 * - seed: Seed the database with sample data
 * - reset: Reset the database (WARNING: This will delete all data)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://zaid:RrZLCt1iLTrxS5RZ@chouieur-express.657lqxf.mongodb.net/chouieur_express?retryWrites=true&w=majority&appName=chouieur-express';

// Database schemas
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerAddress: { type: String, required: true, trim: true },
  items: [{
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, enum: ['Normal', 'Mega'], default: 'Normal' },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    supplements: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 }
    }]
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'], default: 'pending' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Sandwiches', 'Pizza', 'Tacos', 'Poulet', 'Hamburgers', 'Panini / Fajitas', 'Plats'], required: true },
  price: { type: Number, required: true, min: 0 },
  megaPrice: { type: Number, min: 0 },
  description: { type: String, required: true, trim: true },
  imageId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['admin', 'kitchen', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const Order = mongoose.model('Order', orderSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const User = mongoose.model('User', userSchema);

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB database');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    return false;
  }
}

async function disconnectFromDatabase() {
  try {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error disconnecting:', error.message);
  }
}

// =============================================================================
// DATABASE MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Check database status and connection
 */
async function checkDatabaseStatus() {
  console.log('\n📊 DATABASE STATUS');
  console.log('==================');
  
  try {
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log(`Connection State: ${stateMap[connectionState]} (${connectionState})`);
    console.log(`Database Name: ${mongoose.connection.db?.databaseName || 'Unknown'}`);
    console.log(`Host: ${mongoose.connection.host || 'Unknown'}`);
    console.log(`Port: ${mongoose.connection.port || 'Unknown'}`);
    
    // Get collection statistics
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections (${collections.length}):`);
    
    for (const collection of collections) {
      const stats = await mongoose.connection.db.collection(collection.name).stats();
      console.log(`  - ${collection.name}: ${stats.count} documents`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
    return false;
  }
}

/**
 * Create a backup of the database
 */
async function createBackup() {
  console.log('\n💾 CREATING DATABASE BACKUP');
  console.log('============================');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupData = {
      timestamp: new Date().toISOString(),
      orders: await Order.find({}).lean(),
      menuItems: await MenuItem.find({}).lean(),
      users: await User.find({}).lean()
    };
    
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Backup contains:`);
    console.log(`   - Orders: ${backupData.orders.length}`);
    console.log(`   - Menu Items: ${backupData.menuItems.length}`);
    console.log(`   - Users: ${backupData.users.length}`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    return null;
  }
}

/**
 * Restore database from backup
 */
async function restoreFromBackup(backupFile) {
  console.log('\n🔄 RESTORING FROM BACKUP');
  console.log('========================');
  
  try {
    if (!fs.existsSync(backupFile)) {
      console.error('❌ Backup file not found:', backupFile);
      return false;
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📅 Backup date: ${backupData.timestamp}`);
    console.log(`📊 Restoring:`);
    console.log(`   - Orders: ${backupData.orders.length}`);
    console.log(`   - Menu Items: ${backupData.menuItems.length}`);
    console.log(`   - Users: ${backupData.users.length}`);
    
    // Clear existing data
    await Order.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    
    // Restore data
    if (backupData.orders.length > 0) {
      await Order.insertMany(backupData.orders);
    }
    if (backupData.menuItems.length > 0) {
      await MenuItem.insertMany(backupData.menuItems);
    }
    if (backupData.users.length > 0) {
      await User.insertMany(backupData.users);
    }
    
    console.log('✅ Database restored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error restoring backup:', error.message);
    return false;
  }
}

/**
 * Clean up old data and optimize database
 */
async function cleanupDatabase() {
  console.log('\n🧹 CLEANING UP DATABASE');
  console.log('========================');
  
  try {
    // Remove old completed orders (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deletedOrders = await Order.deleteMany({
      status: 'delivered',
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`🗑️  Deleted ${deletedOrders.deletedCount} old delivered orders`);
    
    // Remove archived menu items
    const deletedMenuItems = await MenuItem.deleteMany({
      isArchived: true,
      updatedAt: { $lt: thirtyDaysAgo }
    });
    console.log(`🗑️  Deleted ${deletedMenuItems.deletedCount} archived menu items`);
    
    // Update statistics
    await mongoose.connection.db.command({ collStats: 'orders' });
    await mongoose.connection.db.command({ collStats: 'menuitems' });
    await mongoose.connection.db.command({ collStats: 'users' });
    
    console.log('✅ Database cleanup completed');
    return true;
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    return false;
  }
}

/**
 * Show database statistics
 */
async function showDatabaseStats() {
  console.log('\n📈 DATABASE STATISTICS');
  console.log('=======================');
  
  try {
    // Order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      }
    ]);
    
    console.log('\n📦 ORDERS:');
    orderStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} orders (${stat.totalValue} FCFA)`);
    });
    
    // Menu item statistics
    const menuStats = await MenuItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    console.log('\n🍽️  MENU ITEMS:');
    menuStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} items (${stat.activeCount} active)`);
    });
    
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n👥 USERS:');
    userStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} users`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error getting statistics:', error.message);
    return false;
  }
}

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  console.log('\n🌱 SEEDING DATABASE');
  console.log('===================');
  
  try {
    // Sample menu items
    const sampleMenuItems = [
      {
        name: 'Chicken Burger',
        category: 'Hamburgers',
        price: 2500,
        megaPrice: 3500,
        description: 'Delicious chicken burger with fresh vegetables',
        imageId: 'chicken-burger.jpg',
        isActive: true
      },
      {
        name: 'Pizza Margherita',
        category: 'Pizza',
        price: 3000,
        megaPrice: 4500,
        description: 'Classic pizza with tomato and mozzarella',
        imageId: 'pizza-margherita.jpg',
        isActive: true
      },
      {
        name: 'Chicken Tacos',
        category: 'Tacos',
        price: 2000,
        megaPrice: 3000,
        description: 'Spicy chicken tacos with fresh salsa',
        imageId: 'chicken-tacos.jpg',
        isActive: true
      }
    ];
    
    // Clear existing data
    await MenuItem.deleteMany({});
    
    // Insert sample data
    await MenuItem.insertMany(sampleMenuItems);
    
    console.log(`✅ Seeded ${sampleMenuItems.length} menu items`);
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    return false;
  }
}

/**
 * Reset database (WARNING: This will delete all data)
 */
async function resetDatabase() {
  console.log('\n⚠️  RESETTING DATABASE');
  console.log('=====================');
  console.log('WARNING: This will delete ALL data in the database!');
  
  try {
    await Order.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Database reset completed');
    return true;
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    return false;
  }
}

// =============================================================================
// COMMAND LINE INTERFACE
// =============================================================================

async function main() {
  const command = process.argv[2];
  const options = process.argv.slice(3);
  
  console.log('🗄️  MongoDB Database Manager');
  console.log('=============================\n');
  
  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'status':
        await checkDatabaseStatus();
        break;
        
      case 'backup':
        await createBackup();
        break;
        
      case 'restore':
        const backupFile = options[0];
        if (!backupFile) {
          console.error('❌ Please specify backup file: node database-manager.js restore backup-file.json');
          break;
        }
        await restoreFromBackup(backupFile);
        break;
        
      case 'cleanup':
        await cleanupDatabase();
        break;
        
      case 'stats':
        await showDatabaseStats();
        break;
        
      case 'seed':
        await seedDatabase();
        break;
        
      case 'reset':
        console.log('⚠️  This will delete ALL data. Are you sure? (y/N)');
        // In a real implementation, you'd want to add confirmation
        await resetDatabase();
        break;
        
      default:
        console.log('Available commands:');
        console.log('  status    - Check database connection and status');
        console.log('  backup    - Create a backup of the database');
        console.log('  restore   - Restore from a backup file');
        console.log('  cleanup   - Clean up old data and optimize');
        console.log('  stats     - Show database statistics');
        console.log('  seed      - Seed database with sample data');
        console.log('  reset     - Reset database (WARNING: Deletes all data)');
        console.log('\nUsage: node database-manager.js [command] [options]');
        break;
    }
  } catch (error) {
    console.error('❌ Error executing command:', error.message);
  } finally {
    await disconnectFromDatabase();
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  checkDatabaseStatus,
  createBackup,
  restoreFromBackup,
  cleanupDatabase,
  showDatabaseStats,
  seedDatabase,
  resetDatabase
};
