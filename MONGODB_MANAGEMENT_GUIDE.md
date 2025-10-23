# 🗄️ MongoDB Database Management Guide

This guide provides comprehensive instructions for managing your MongoDB database for the Chouieur Express project.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Database Management Tools](#database-management-tools)
- [Environment Setup](#environment-setup)
- [Monitoring & Performance](#monitoring--performance)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Initialize MongoDB setup
node setup-mongodb.js --init

# Test database connection
node setup-mongodb.js --test

# Seed with sample data
node setup-mongodb.js --seed
```

### 2. Start Monitoring

```bash
# Start continuous monitoring
node database-monitor.js --watch

# Check current status
node database-monitor.js --status
```

### 3. Database Management

```bash
# Create backup
node database-manager.js backup

# Show database statistics
node database-manager.js stats

# Clean up old data
node database-manager.js cleanup
```

## 🛠️ Database Management Tools

### Database Manager (`database-manager.js`)

Comprehensive database management utility with the following commands:

| Command | Description |
|---------|-------------|
| `status` | Check database connection and status |
| `backup` | Create a backup of the database |
| `restore` | Restore from a backup file |
| `cleanup` | Clean up old data and optimize database |
| `stats` | Show database statistics |
| `seed` | Seed database with sample data |
| `reset` | Reset database (WARNING: Deletes all data) |

**Usage Examples:**

```bash
# Check database status
node database-manager.js status

# Create backup
node database-manager.js backup

# Restore from backup
node database-manager.js restore backup-2024-01-15T10-30-00-000Z.json

# Show statistics
node database-manager.js stats

# Clean up old data
node database-manager.js cleanup
```

### Database Monitor (`database-monitor.js`)

Real-time monitoring with performance metrics and alerts:

| Option | Description |
|--------|-------------|
| `--watch` | Start continuous monitoring |
| `--status` | Show current status |
| `--metrics` | Show performance metrics |
| `--alerts` | Show alert history |
| `--save` | Save monitoring data to file |

**Usage Examples:**

```bash
# Start continuous monitoring
node database-monitor.js --watch

# Check current status
node database-monitor.js --status

# View performance metrics
node database-monitor.js --metrics

# View alert history
node database-monitor.js --alerts
```

### Setup Script (`setup-mongodb.js`)

Initial setup and configuration:

| Option | Description |
|--------|-------------|
| `--init` | Initialize MongoDB setup |
| `--test` | Test database connection |
| `--seed` | Seed with sample data |
| `--optimize` | Optimize database performance |
| `--backup` | Configure backup settings |

## 🔧 Environment Setup

### Environment Variables

Create a `.env` file with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

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
```

### MongoDB Connection String

Your MongoDB connection string should follow this format:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## 📊 Monitoring & Performance

### Health Checks

The monitoring system performs regular health checks with the following metrics:

- **Connection Time**: Time to establish database connection
- **Response Time**: Time for database operations
- **Memory Usage**: Database memory utilization
- **Active Connections**: Number of active connections

### Alert Thresholds

Default alert thresholds:

- Connection Time: > 5 seconds
- Memory Usage: > 80%
- Response Time: > 1 second

### Performance Optimization

The system automatically creates indexes for better performance:

- **Orders**: `userId`, `status`, `createdAt`, `customerName`
- **Menu Items**: `category`, `isActive`, `name` (text search)
- **Users**: `firebaseUid`, `email`, `role`

## 💾 Backup & Recovery

### Automatic Backups

Configure automatic backups with the following settings:

```json
{
  "enabled": true,
  "schedule": "0 2 * * *",
  "retention": 30,
  "compression": true,
  "location": "./backups"
}
```

### Manual Backup

```bash
# Create backup
node database-manager.js backup

# List available backups
ls backups/

# Restore from backup
node database-manager.js restore backups/backup-2024-01-15T10-30-00-000Z.json
```

### Backup Retention

- **Default**: 30 days
- **Location**: `./backups/`
- **Format**: JSON with timestamp
- **Compression**: Optional

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Failed

**Error**: `MongoServerError: connection failed`

**Solutions**:
- Check MongoDB URI in `.env` file
- Verify network connectivity
- Check MongoDB Atlas cluster status
- Verify credentials

#### 2. Slow Performance

**Symptoms**: High response times, slow queries

**Solutions**:
- Check database indexes
- Monitor memory usage
- Optimize queries
- Scale database resources

#### 3. Memory Issues

**Error**: High memory usage alerts

**Solutions**:
- Clean up old data
- Optimize queries
- Increase database resources
- Review data retention policies

### Debug Commands

```bash
# Test connection
node setup-mongodb.js --test

# Check status
node database-monitor.js --status

# View metrics
node database-monitor.js --metrics

# Check alerts
node database-monitor.js --alerts
```

### Log Files

Monitor logs for issues:

- **Application logs**: Check console output
- **MongoDB logs**: Check MongoDB Atlas logs
- **Monitoring data**: `monitoring-data.json`

## 📈 Best Practices

### 1. Regular Maintenance

- Run cleanup weekly: `node database-manager.js cleanup`
- Monitor performance: `node database-monitor.js --watch`
- Create backups: `node database-manager.js backup`

### 2. Performance Optimization

- Use indexes for frequently queried fields
- Monitor query performance
- Clean up old data regularly
- Optimize connection pooling

### 3. Security

- Use strong passwords
- Enable authentication
- Regular security updates
- Monitor access logs

### 4. Monitoring

- Set up alerts for critical issues
- Monitor performance metrics
- Regular health checks
- Backup verification

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review error logs
3. Test database connection
4. Verify environment variables
5. Check MongoDB Atlas status

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Node.js MongoDB Driver](https://docs.mongodb.com/drivers/node/)

---

**Note**: This guide assumes you have Node.js and npm installed. Make sure to install required dependencies before running the scripts.
