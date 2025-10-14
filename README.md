# Chouieur Express

A modern food ordering platform built with Next.js, Firebase, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd your-project
npm install
```

### 2. Set Up Environment Variables
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB Database
```bash
# Start MongoDB container
docker-compose up -d

# Check if MongoDB is running
docker-compose ps
```

### 4. Run the Application
```bash
# Development mode
npm run dev

# The app will be available at http://localhost:3000
```

## 🗄️ Database Setup

### MongoDB Atlas (Production)

This application is configured to use **MongoDB Atlas** for production deployment.

#### Environment Configuration
1. **Create `.env` file**:
   ```bash
   cp env.example .env
   ```

2. **Your MongoDB Atlas connection string is already configured**:
   ```env
   MONGO_URI=mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
   ```

#### Database Connection
The application uses two connection files:
- **`db.js`**: Main database connection with error handling
- **`server.js`**: Server initialization that connects to MongoDB

### Local Development (Optional)

For offline development, you can use MongoDB in Docker:

#### Start/Stop Local MongoDB
```bash
# Start MongoDB container
docker-compose up -d

# Stop MongoDB container
docker-compose down

# View logs
docker-compose logs -f
```

#### Switch to Local MongoDB
To use local MongoDB instead of Atlas:

1. **Update `.env` file**:
   ```env
   # Comment out Atlas connection
   # MONGO_URI=mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
   
   # Use local connection
   MONGO_URI=mongodb://localhost:27017/myapp_db
   ```

2. **Start local MongoDB**:
   ```bash
   docker-compose up -d
   ```

3. **Restart your application**

#### Backup and Restore (Local)
```bash
# Backup MongoDB
docker exec myapp-mongo mongodump --db myapp_db --out /data/backup
docker cp myapp-mongo:/data/backup ./backup

# Restore MongoDB
docker cp ./backup myapp-mongo:/data/backup
docker exec myapp-mongo mongorestore --db myapp_db /data/backup/myapp_db
```

## 🌐 Render Deployment

### Frontend/Backend Deployment
1. **Connect your GitHub repository to Render**
2. **Set environment variables in Render dashboard**:
   ```
   MONGO_URI=mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   ```

### Database Configuration
**Your MongoDB Atlas connection is already configured!** 

The application will automatically connect to your MongoDB Atlas cluster when deployed to Render.

#### Environment Variables for Render
| Variable | Value |
|----------|-------|
| `MONGO_URI` | `mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.onrender.com` |

### Switching Database Locations

#### To Use Different MongoDB Atlas Cluster
1. **Get new connection string** from MongoDB Atlas dashboard
2. **Update `MONGO_URI`** in Render environment variables
3. **Redeploy your application**

#### To Use Local MongoDB (Development Only)
1. **Update `.env` file**:
   ```env
   MONGO_URI=mongodb://localhost:27017/myapp_db
   ```
2. **Start local MongoDB**:
   ```bash
   docker-compose up -d
   ```
3. **Restart your application**

#### To Use Another PC's MongoDB
1. **Update `MONGO_URI`** with the target PC's IP:
   ```env
   MONGO_URI=mongodb://192.168.1.100:27017/myapp_db
   ```
2. **Ensure the target PC allows connections** on port 27017
3. **Restart your application**

## 🏗️ Project Structure

```
├── db.js               # MongoDB connection with Mongoose
├── server.js           # Server initialization
├── docker-compose.yml  # Local MongoDB container
├── env.example         # Environment variables template
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers
│   ├── firebase/       # Firebase configuration
│   ├── lib/            # Utilities and configurations
│   │   ├── models/     # MongoDB models
│   │   └── mongodb.ts  # TypeScript MongoDB connection
│   └── hooks/          # Custom React hooks
└── scripts/
    └── test-mongodb.js # MongoDB connection test
```

## 🔌 Database Connection Files

### `db.js` - Main Database Connection
- Handles MongoDB connection using Mongoose
- Reads `MONGO_URI` from environment variables
- Provides error handling and connection status
- Logs "✅ MongoDB Connected" on success

### `server.js` - Server Initialization
- Imports and initializes database connection
- Should be imported in your main app file
- Handles server startup and database connection

### Usage in Your App
```javascript
// Import in your main app file (e.g., app.js, index.js)
require('./server');

// Or import the connection function directly
const { connectToMongoDB } = require('./db');
await connectToMongoDB();
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Auth
- **Deployment**: Render
- **Container**: Docker

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/myapp_db` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use strong passwords for MongoDB
- Enable authentication in production
- Use MongoDB Atlas for production deployments
- Regularly update dependencies

## 📞 Support

If you encounter issues:

1. Check if MongoDB container is running: `docker-compose ps`
2. Verify environment variables in `.env`
3. Check application logs for connection errors
4. Ensure port 27017 is not blocked

---

**Happy coding! 🚀**
