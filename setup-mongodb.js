/**
 * =============================================================================
 * MONGODB SETUP SCRIPT
 * =============================================================================
 * 
 * This script helps you set up MongoDB for your project with all necessary
 * configurations, environment variables, and initial data.
 * 
 * FEATURES:
 * =========
 * - Environment setup
 * - Database connection testing
 * - Initial data seeding
 * - Performance optimization
 * - Backup configuration
 * 
 * USAGE:
 * ======
 * node setup-mongodb.js [options]
 * 
 * OPTIONS:
 * ========
 * --init      - Initialize MongoDB setup
 * --test      - Test database connection
 * --seed      - Seed with sample data
 * --optimize  - Optimize database performance
 * --backup    - Configure backup settings
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
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
// SETUP FUNCTIONS
// =============================================================================

/**
 * Initialize MongoDB setup
 */
async function initializeSetup() {
  console.log('🚀 Initializing MongoDB Setup');
  console.log('==============================\n');
  
  try {
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      console.log('📝 Creating .env file...');
      await createEnvFile();
    } else {
      console.log('✅ .env file already exists');
    }
    
    // Test database connection
    console.log('\n🔗 Testing database connection...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ Database connection successful');
      
      // Create indexes for better performance
      console.log('\n📊 Creating database indexes...');
      await createIndexes();
      
      // Set up monitoring
      console.log('\n📈 Setting up monitoring...');
      await setupMonitoring();
      
      console.log('\n🎉 MongoDB setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Run: node database-manager.js seed');
      console.log('2. Run: node database-monitor.js --watch');
      console.log('3. Start your application: npm start');
    } else {
      console.log('❌ Database connection failed');
      console.log('Please check your MONGO_URI in the .env file');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

/**
 * Create .env file with MongoDB configuration
 */
async function createEnvFile() {
  const envContent = `# =============================================================================
# CHOUIEUR EXPRESS - MONGODB CONFIGURATION
# =============================================================================

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGO_URI=${MONGO_URI}

# Performance Configuration
ENABLE_CACHE=true
CACHE_TTL=300
DB_POOL_SIZE=10
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Database Management
BACKUP_RETENTION_DAYS=30
CLEANUP_INTERVAL_HOURS=24
MAX_ORDER_HISTORY_DAYS=90

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here

# Monitoring
ENABLE_HEALTH_CHECKS=true
HEALTH_CHECK_INTERVAL=30000
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    // Test with a simple ping
    await mongoose.connection.db.admin().ping();
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

/**
 * Create database indexes for better performance
 */
async function createIndexes() {
  try {
    // Order indexes
    await Order.collection.createIndex({ userId: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    await Order.collection.createIndex({ customerName: 1 });
    
    // Menu item indexes
    await MenuItem.collection.createIndex({ category: 1 });
    await MenuItem.collection.createIndex({ isActive: 1 });
    await MenuItem.collection.createIndex({ name: 'text' });
    
    // User indexes
    await User.collection.createIndex({ firebaseUid: 1 });
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ role: 1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
}

/**
 * Set up monitoring configuration
 */
async function setupMonitoring() {
  try {
    // Create monitoring directory
    const monitoringDir = path.join(__dirname, 'monitoring');
    if (!fs.existsSync(monitoringDir)) {
      fs.mkdirSync(monitoringDir, { recursive: true });
    }
    
    // Create monitoring configuration
    const monitoringConfig = {
      enabled: true,
      interval: 30000,
      alerts: {
        connectionTime: 5000,
        memoryUsage: 0.8,
        responseTime: 1000
      },
      retention: {
        healthChecks: 100,
        alerts: 50
      }
    };
    
    const configFile = path.join(monitoringDir, 'config.json');
    fs.writeFileSync(configFile, JSON.stringify(monitoringConfig, null, 2));
    
    console.log('✅ Monitoring configuration created');
  } catch (error) {
    console.error('❌ Error setting up monitoring:', error.message);
  }
}

/**
 * Test database connection
 */
async function testDatabase() {
  console.log('🧪 Testing Database Connection');
  console.log('==============================\n');
  
  try {
    const startTime = Date.now();
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    const connectionTime = Date.now() - startTime;
    
    // Test basic operations
    await mongoose.connection.db.admin().ping();
    
    // Get database info
    const dbStats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('✅ Connection successful');
    console.log(`⏱️  Connection time: ${connectionTime}ms`);
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📁 Collections: ${collections.length}`);
    console.log(`💾 Storage size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 Data size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  console.log('🌱 Seeding Database');
  console.log('===================\n');
  
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
      },
      {
        name: 'Grilled Chicken',
        category: 'Poulet',
        price: 4000,
        megaPrice: 5500,
        description: 'Tender grilled chicken with herbs',
        imageId: 'grilled-chicken.jpg',
        isActive: true
      }
    ];
    
    // Clear existing data
    await MenuItem.deleteMany({});
    
    // Insert sample data
    await MenuItem.insertMany(sampleMenuItems);
    
    console.log(`✅ Seeded ${sampleMenuItems.length} menu items`);
    
    // Show seeded data
    const categories = await MenuItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Menu items by category:');
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} items`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    return false;
  }
}

/**
 * Optimize database performance
 */
async function optimizeDatabase() {
  console.log('⚡ Optimizing Database Performance');
  console.log('=================================\n');
  
  try {
    // Create additional indexes for better performance
    await Order.collection.createIndex({ status: 1, createdAt: -1 });
    await Order.collection.createIndex({ customerPhone: 1 });
    await MenuItem.collection.createIndex({ isActive: 1, category: 1 });
    
    // Analyze collections
    const orderStats = await Order.collection.stats();
    const menuStats = await MenuItem.collection.stats();
    
    console.log('✅ Performance optimization completed');
    console.log(`📊 Orders collection: ${orderStats.count} documents`);
    console.log(`📊 Menu items collection: ${menuStats.count} documents`);
    
    return true;
  } catch (error) {
    console.error('❌ Error optimizing database:', error.message);
    return false;
  }
}

/**
 * Configure backup settings
 */
async function configureBackup() {
  console.log('💾 Configuring Backup Settings');
  console.log('==============================\n');
  
  try {
    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup configuration
    const backupConfig = {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: 30, // Keep backups for 30 days
      compression: true,
      location: backupDir
    };
    
    const configFile = path.join(backupDir, 'backup-config.json');
    fs.writeFileSync(configFile, JSON.stringify(backupConfig, null, 2));
    
    console.log('✅ Backup configuration created');
    console.log(`📁 Backup directory: ${backupDir}`);
    console.log('🕐 Schedule: Daily at 2 AM');
    console.log('📅 Retention: 30 days');
    
    return true;
  } catch (error) {
    console.error('❌ Error configuring backup:', error.message);
    return false;
  }
}

// =============================================================================
// COMMAND LINE INTERFACE
// =============================================================================

async function main() {
  const command = process.argv[2];
  
  console.log('🗄️  MongoDB Setup Script');
  console.log('=========================\n');
  
  try {
    switch (command) {
      case '--init':
        await initializeSetup();
        break;
        
      case '--test':
        await testDatabase();
        break;
        
      case '--seed':
        await mongoose.connect(MONGO_URI);
        await seedDatabase();
        break;
        
      case '--optimize':
        await mongoose.connect(MONGO_URI);
        await optimizeDatabase();
        break;
        
      case '--backup':
        await configureBackup();
        break;
        
      default:
        console.log('Available options:');
        console.log('  --init      - Initialize MongoDB setup');
        console.log('  --test      - Test database connection');
        console.log('  --seed      - Seed with sample data');
        console.log('  --optimize  - Optimize database performance');
        console.log('  --backup    - Configure backup settings');
        console.log('\nUsage: node setup-mongodb.js [option]');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (command !== '--init') {
      await mongoose.connection.close();
    }
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  initializeSetup,
  testDatabase,
  seedDatabase,
  optimizeDatabase,
  configureBackup
};
