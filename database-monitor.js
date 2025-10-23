/**
 * =============================================================================
 * MONGODB DATABASE MONITORING DASHBOARD
 * =============================================================================
 * 
 * Real-time monitoring of your MongoDB database with performance metrics,
 * connection status, and automated health checks.
 * 
 * FEATURES:
 * =========
 * - Real-time connection monitoring
 * - Performance metrics tracking
 * - Automated health checks
 * - Alert system for issues
 * - Database statistics dashboard
 * 
 * USAGE:
 * ======
 * node database-monitor.js [options]
 * 
 * OPTIONS:
 * ========
 * --watch    - Start continuous monitoring
 * --status   - Show current status
 * --alerts   - Show alert history
 * --metrics  - Show performance metrics
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://zaid:RrZLCt1iLTrxS5RZ@chouieur-express.657lqxf.mongodb.net/chouieur_express?retryWrites=true&w=majority&appName=chouieur-express';
const MONITOR_INTERVAL = 30000; // 30 seconds
const ALERT_THRESHOLDS = {
  connectionTime: 5000, // 5 seconds
  memoryUsage: 0.8, // 80%
  responseTime: 1000 // 1 second
};

// Monitoring data
let monitoringData = {
  startTime: new Date(),
  connectionStatus: 'disconnected',
  lastCheck: null,
  metrics: {
    totalConnections: 0,
    failedConnections: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    activeConnections: 0
  },
  alerts: [],
  history: []
};

// Database schemas (same as in database-manager.js)
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
// MONITORING FUNCTIONS
// =============================================================================

/**
 * Connect to MongoDB with monitoring
 */
async function connectWithMonitoring() {
  const startTime = Date.now();
  
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    const connectionTime = Date.now() - startTime;
    monitoringData.connectionStatus = 'connected';
    monitoringData.metrics.totalConnections++;
    monitoringData.metrics.averageResponseTime = 
      (monitoringData.metrics.averageResponseTime + connectionTime) / 2;
    
    // Check for alerts
    if (connectionTime > ALERT_THRESHOLDS.connectionTime) {
      addAlert('warning', `Slow connection time: ${connectionTime}ms`);
    }
    
    console.log(`✅ Connected to MongoDB (${connectionTime}ms)`);
    return true;
  } catch (error) {
    monitoringData.connectionStatus = 'disconnected';
    monitoringData.metrics.failedConnections++;
    addAlert('error', `Connection failed: ${error.message}`);
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * Perform health check
 */
async function performHealthCheck() {
  const startTime = Date.now();
  
  try {
    // Test basic operations
    await mongoose.connection.db.admin().ping();
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    
    // Check collection counts
    const orderCount = await Order.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();
    const userCount = await User.countDocuments();
    
    const responseTime = Date.now() - startTime;
    
    // Update metrics
    monitoringData.metrics.averageResponseTime = 
      (monitoringData.metrics.averageResponseTime + responseTime) / 2;
    monitoringData.metrics.memoryUsage = stats.dataSize / stats.storageSize;
    monitoringData.metrics.activeConnections = mongoose.connection.readyState;
    
    // Check for alerts
    if (responseTime > ALERT_THRESHOLDS.responseTime) {
      addAlert('warning', `Slow response time: ${responseTime}ms`);
    }
    
    if (monitoringData.metrics.memoryUsage > ALERT_THRESHOLDS.memoryUsage) {
      addAlert('warning', `High memory usage: ${(monitoringData.metrics.memoryUsage * 100).toFixed(1)}%`);
    }
    
    // Store health check data
    const healthData = {
      timestamp: new Date(),
      responseTime,
      orderCount,
      menuItemCount,
      userCount,
      memoryUsage: monitoringData.metrics.memoryUsage,
      connectionStatus: monitoringData.connectionStatus
    };
    
    monitoringData.history.push(healthData);
    monitoringData.lastCheck = new Date();
    
    // Keep only last 100 health checks
    if (monitoringData.history.length > 100) {
      monitoringData.history.shift();
    }
    
    return healthData;
  } catch (error) {
    addAlert('error', `Health check failed: ${error.message}`);
    console.error('❌ Health check failed:', error.message);
    return null;
  }
}

/**
 * Add alert to monitoring data
 */
function addAlert(level, message) {
  const alert = {
    timestamp: new Date(),
    level,
    message
  };
  
  monitoringData.alerts.push(alert);
  
  // Keep only last 50 alerts
  if (monitoringData.alerts.length > 50) {
    monitoringData.alerts.shift();
  }
  
  console.log(`🚨 ${level.toUpperCase()}: ${message}`);
}

/**
 * Display current status
 */
function displayStatus() {
  console.log('\n📊 DATABASE MONITORING STATUS');
  console.log('==============================');
  console.log(`Start Time: ${monitoringData.startTime.toLocaleString()}`);
  console.log(`Last Check: ${monitoringData.lastCheck ? monitoringData.lastCheck.toLocaleString() : 'Never'}`);
  console.log(`Connection Status: ${monitoringData.connectionStatus}`);
  console.log(`Total Connections: ${monitoringData.metrics.totalConnections}`);
  console.log(`Failed Connections: ${monitoringData.metrics.failedConnections}`);
  console.log(`Average Response Time: ${monitoringData.metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`Memory Usage: ${(monitoringData.metrics.memoryUsage * 100).toFixed(1)}%`);
  console.log(`Active Connections: ${monitoringData.metrics.activeConnections}`);
  console.log(`Recent Alerts: ${monitoringData.alerts.length}`);
}

/**
 * Display performance metrics
 */
function displayMetrics() {
  console.log('\n📈 PERFORMANCE METRICS');
  console.log('======================');
  
  if (monitoringData.history.length === 0) {
    console.log('No metrics available yet. Run monitoring for a while.');
    return;
  }
  
  const recent = monitoringData.history.slice(-10);
  const responseTimes = recent.map(h => h.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const maxResponseTime = Math.max(...responseTimes);
  const minResponseTime = Math.min(...responseTimes);
  
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Max Response Time: ${maxResponseTime}ms`);
  console.log(`Min Response Time: ${minResponseTime}ms`);
  console.log(`Data Points: ${monitoringData.history.length}`);
  
  // Show recent health checks
  console.log('\nRecent Health Checks:');
  recent.forEach((check, index) => {
    console.log(`  ${index + 1}. ${check.timestamp.toLocaleTimeString()} - ${check.responseTime}ms - ${check.orderCount} orders`);
  });
}

/**
 * Display alerts
 */
function displayAlerts() {
  console.log('\n🚨 ALERT HISTORY');
  console.log('================');
  
  if (monitoringData.alerts.length === 0) {
    console.log('No alerts recorded.');
    return;
  }
  
  const recentAlerts = monitoringData.alerts.slice(-10);
  recentAlerts.forEach((alert, index) => {
    const level = alert.level.toUpperCase();
    const timestamp = alert.timestamp.toLocaleString();
    console.log(`${index + 1}. [${level}] ${timestamp}: ${alert.message}`);
  });
}

/**
 * Start continuous monitoring
 */
async function startMonitoring() {
  console.log('🔄 Starting continuous monitoring...');
  console.log(`Check interval: ${MONITOR_INTERVAL / 1000} seconds`);
  console.log('Press Ctrl+C to stop\n');
  
  // Initial connection
  await connectWithMonitoring();
  
  // Start monitoring loop
  const interval = setInterval(async () => {
    console.log(`\n[${new Date().toLocaleTimeString()}] Performing health check...`);
    await performHealthCheck();
  }, MONITOR_INTERVAL);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping monitoring...');
    clearInterval(interval);
    await mongoose.connection.close();
    console.log('✅ Monitoring stopped');
    process.exit(0);
  });
}

/**
 * Save monitoring data to file
 */
function saveMonitoringData() {
  const dataFile = path.join(__dirname, 'monitoring-data.json');
  const data = {
    ...monitoringData,
    exportedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  console.log(`📁 Monitoring data saved to: ${dataFile}`);
}

// =============================================================================
// COMMAND LINE INTERFACE
// =============================================================================

async function main() {
  const command = process.argv[2];
  
  console.log('📊 MongoDB Database Monitor');
  console.log('============================\n');
  
  try {
    switch (command) {
      case '--watch':
        await startMonitoring();
        break;
        
      case '--status':
        await connectWithMonitoring();
        await performHealthCheck();
        displayStatus();
        break;
        
      case '--metrics':
        displayMetrics();
        break;
        
      case '--alerts':
        displayAlerts();
        break;
        
      case '--save':
        saveMonitoringData();
        break;
        
      default:
        console.log('Available options:');
        console.log('  --watch    - Start continuous monitoring');
        console.log('  --status   - Show current status');
        console.log('  --metrics  - Show performance metrics');
        console.log('  --alerts   - Show alert history');
        console.log('  --save     - Save monitoring data to file');
        console.log('\nUsage: node database-monitor.js [option]');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (command !== '--watch') {
      await mongoose.connection.close();
    }
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  connectWithMonitoring,
  performHealthCheck,
  displayStatus,
  displayMetrics,
  displayAlerts,
  startMonitoring,
  saveMonitoringData
};
