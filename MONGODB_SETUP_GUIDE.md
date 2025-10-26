# MongoDB Setup Guide for Chouieur Express

This guide will help you set up MongoDB for your Chouieur Express application.

## 🚀 Quick Start Options

### Option 1: MongoDB Atlas (Cloud - Recommended)
MongoDB Atlas is the easiest way to get started with MongoDB in the cloud.

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Create a free cluster (M0 Sandbox)
3. **Get Connection String**: Copy your connection string
4. **Set Environment Variable**: Update your deployment with the connection string

### Option 2: Local MongoDB Installation
Install MongoDB locally on your development machine.

#### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Use connection string: `mongodb://localhost:27017/chouieur-express`

#### macOS:
```bash
# Install with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Use connection string: mongodb://localhost:27017/chouieur-express
```

#### Linux (Ubuntu/Debian):
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Use connection string: mongodb://localhost:27017/chouieur-express
```

## 🔧 Environment Configuration

### For Local Development:
Create a `.env` file in the `api` directory:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chouieur-express
FRONTEND_URL=http://localhost:3000
```

### For Production Deployment:

#### Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend URL

#### Render Deployment:
1. Go to your Render service dashboard
2. Navigate to Environment tab
3. Add the following variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend URL

## 📊 Database Seeding

After setting up MongoDB, you can populate it with sample data:

```bash
# Navigate to the api directory
cd api

# Run the seed script
node seed.js
```

This will create:
- 6 sample menu items
- 2 sample orders
- 3 sample users (admin, kitchen, customer)

## 🗄️ Database Models

### MenuItem Model
- **name**: Menu item name
- **category**: Pizza, Burgers, Appetizers, Salads, Beverages, Sides, Desserts
- **price**: Price in cents (e.g., 5000 = $50.00)
- **megaPrice**: Optional larger size price
- **description**: Item description
- **imageUrl**: Image URL
- **isActive**: Whether item is available
- **ingredients**: Array of ingredients
- **allergens**: Array of allergens
- **preparationTime**: Preparation time in minutes
- **calories**: Calorie count
- **tags**: Array of tags

### Order Model
- **orderId**: Unique order identifier
- **customerName**: Customer name
- **customerPhone**: Customer phone number
- **customerAddress**: Delivery address
- **customerEmail**: Customer email
- **items**: Array of order items
- **subtotal**: Subtotal in cents
- **tax**: Tax amount in cents
- **deliveryFee**: Delivery fee in cents
- **total**: Total amount in cents
- **status**: pending, confirmed, preparing, ready, delivered, cancelled
- **orderType**: delivery, pickup
- **paymentMethod**: cash, card, online
- **paymentStatus**: pending, paid, failed, refunded
- **notes**: Order notes
- **estimatedDeliveryTime**: Estimated delivery time
- **actualDeliveryTime**: Actual delivery time

### User Model
- **email**: User email (unique)
- **name**: User name
- **phone**: Phone number
- **role**: admin, kitchen, customer
- **isActive**: Whether user is active
- **preferences**: User preferences
- **address**: User address
- **orderHistory**: Array of order IDs
- **lastLogin**: Last login timestamp
- **loginCount**: Number of logins

## 🔌 API Endpoints

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/:id` - Get single menu item
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders (with pagination)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Admin
- `GET /api/admin/stats` - Get admin statistics

### File Upload
- `POST /api/menu-items/upload-image` - Upload menu item image
- `DELETE /api/menu-items/delete-image/:filename` - Delete image

## 🚀 Deployment Steps

### 1. Set up MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account
2. Create a free cluster
3. Get connection string
4. Add connection string to environment variables

### 2. Deploy Backend
```bash
# Deploy to Vercel
vercel --prod

# Or deploy to Render
# Connect your GitHub repository to Render
# Set environment variables in Render dashboard
```

### 3. Deploy Frontend
```bash
# Deploy to Vercel
vercel --prod
```

### 4. Seed Production Database
After deployment, you can seed the production database:
```bash
# Set production MONGO_URI and run
node seed.js
```

## 🔍 Testing the Integration

### Health Check
```bash
curl https://your-backend-url.vercel.app/api/health
```

### Get Menu Items
```bash
curl https://your-backend-url.vercel.app/api/menu-items
```

### Get Orders
```bash
curl https://your-backend-url.vercel.app/api/orders
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check MongoDB URI format
   - Ensure MongoDB is running (for local)
   - Check network access (for Atlas)

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check database user permissions

3. **Environment Variables Not Set**
   - Verify environment variables are set in deployment platform
   - Check variable names match exactly

4. **CORS Issues**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in api/index.js

### Debug Commands:
```bash
# Check MongoDB connection
node -e "require('./config/database').connectToMongoDB()"

# Test seed script
node seed.js

# Check environment variables
node -e "console.log(process.env.MONGO_URI)"
```

## 📈 Next Steps

1. **Set up MongoDB Atlas** for production
2. **Configure environment variables** in your deployment platform
3. **Deploy the backend** with MongoDB integration
4. **Seed the database** with sample data
5. **Test all endpoints** to ensure everything works
6. **Monitor performance** and optimize as needed

Your Chouieur Express application is now ready with full MongoDB integration! 🎉
