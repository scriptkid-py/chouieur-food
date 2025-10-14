# 🚀 Render Deployment Guide for Chouieur Express

This guide explains how to deploy your Chouieur Express application to Render with separate frontend and backend services.

## 📁 Project Structure

```
chouieur-express/
├── client/                 # Frontend (Next.js)
│   ├── src/               # React components and pages
│   ├── package.json       # Frontend dependencies
│   └── next.config.ts     # Next.js configuration
├── server/                # Backend (Express + MongoDB)
│   ├── server.js          # Express server entry point
│   ├── db.js              # MongoDB connection
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
└── README.md              # Project documentation
```

## 🌐 Render Deployment Setup

### Step 1: Create Two Render Services

You need to create **two separate services** on Render:

1. **Backend Service** (Express API)
2. **Frontend Service** (Next.js App)

### Step 2: Backend Service Configuration

#### Service Settings:
- **Name**: `chouieur-express-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `server`

#### Environment Variables:
```
MONGO_URI=mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
NODE_ENV=production
CLIENT_URL=https://your-frontend-service.onrender.com
PORT=5000
```

### Step 3: Frontend Service Configuration

#### Service Settings:
- **Name**: `chouieur-express-frontend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `client`

#### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
NODE_ENV=production
```

## 🔧 Local Development

### Backend Development:
```bash
cd server
npm install
cp env.example .env
npm run dev
```

### Frontend Development:
```bash
cd client
npm install
npm run dev
```

## 📡 API Configuration

### Update API URLs for Production

In your frontend code, update API calls to use the backend URL:

```javascript
// In your frontend components
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Example API call
const response = await fetch(`${API_BASE_URL}/api/orders`);
```

### CORS Configuration

The backend is already configured with CORS to allow requests from your frontend domain.

## 🔄 Deployment Process

1. **Push to GitHub**: Your code is already on GitHub
2. **Connect to Render**: Link your GitHub repository to Render
3. **Create Backend Service**: Configure the server folder
4. **Create Frontend Service**: Configure the client folder
5. **Set Environment Variables**: Add the required environment variables
6. **Deploy**: Render will automatically deploy both services

## 🗄️ Database Configuration

### MongoDB Atlas (Production)
- Your MongoDB Atlas connection string is already configured
- No additional setup required for the database

### Local Development (Optional)
```bash
# Start local MongoDB with Docker
docker-compose up -d

# Update server/.env to use local MongoDB
MONGO_URI=mongodb://localhost:27017/myapp_db
```

## 🔐 Security Notes

- ✅ Environment variables are properly configured
- ✅ CORS is set up for production domains
- ✅ MongoDB credentials are secure
- ✅ Helmet.js provides security headers

## 📝 Environment Variables Reference

### Backend (.env):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.onrender.com
```

### Frontend (.env):
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

## 🚀 Quick Deploy Commands

### Backend Build & Start:
```bash
npm install && npm start
```

### Frontend Build & Start:
```bash
npm install && npm run build && npm start
```

## 🔍 Testing Deployment

1. **Backend Health Check**: `https://your-backend.onrender.com/api/health`
2. **Frontend**: `https://your-frontend.onrender.com`
3. **API Integration**: Test order creation and retrieval

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check MongoDB Atlas connection

---

**Your Chouieur Express app is ready for production deployment! 🎉**
