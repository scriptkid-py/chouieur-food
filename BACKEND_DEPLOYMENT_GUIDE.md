# 🚀 Backend Deployment Guide - Google Sheets Database

## 📋 Overview
This guide covers deploying your Express.js backend with Google Sheets integration to Render.

## 🏗️ Backend Structure
```
.
├── index.js                 # Main backend server
├── package.json             # Dependencies and scripts
├── env.template             # Environment variables template
└── BACKEND_DEPLOYMENT_GUIDE.md
```

## 🎯 Render Backend Service Configuration

### 1. Create New Web Service
- **Name**: `chouieur-express-backend`
- **Environment**: `Node`
- **Region**: Choose your preferred region
- **Branch**: `master`
- **Root Directory**: Leave empty (root directory)
- **Build Command**: `npm ci`
- **Start Command**: `npm run backend`

### 2. Environment Variables
Add these environment variables in Render dashboard:

```bash
# Backend Configuration
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-service.onrender.com

# Google Sheets Database Configuration
GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCHoQYJ0nK7mFFZ\nomz6vLAKAHRqCcF4fOo/G8WOecrgd5uxl7g1k9y1c19lGKPBgOz2pIHSLpqCiTVO\nZkQBAEUmJWwF8HfWvU2Il3fA23VcP9XTWdRSaW4BQk9IaVTKrMbebyVV33wxZFtF\n9dLf0jZtXom25gNuVeWmctOa6k5W5eSCa1PIaOZNYmkNzXVH5dSIJLacwhUlJNyv\n9QUzHiX6uGEozmJYpGRduwhQNxXBr3YW5ZKXn9fb5D8CTHo2dZORdeASYDJ818nA\nepAbJmG+bDlo7RpDCqg4W5srZSpjSHE/rT4Bsr0wet8X1hPehDom2dTt7UFB72e/\nCSdtLnbZAgMBAAECggIACOnRLsYQ2jlJZ12gUd4ip5WeEPXxLAzxjBBI0KofgiF3z\n8njpF0RPZfFeHJPA90+UwyTOj1SWvOttgGiCIZq18KrW7ZD/HzKzrL1flmIV1Wkw\nkUI/DOd23khQU47wjp1KOIYPaxRT4h8ZTIC6ShFTmF51KHr3UMH+ZLD5LR4m5dj/\nbI8027B8eGl6C/S62rKJL9k1fCfLIeqL1qRcpqhr2+VhLikqcHNH2bazpUVer6mn\nQzi2ME8HUoAM8+Q6syv/y77nVqAyXDJVuvHdqQXMB9hzzsqan8RA2Rjgz7NK5N8P\nq6DfX3pJm5VoULKLvgv+BNwIAlRhtTKcmHeg5BUs3QKBgQC65IWydG2vUFqDkFpS\n+mL963I4JbjAdoZR2Sptc5lazg5U4QPY6px2qLGTBU3Bw4hm04LHaxzC2BXaw5K2\n8rLg6L3t5cETc/U1qwD2zCkZukqq3sGL7PX6utnTZXgYFPFs+CaMl1lpi73ZvrDI\ns22MaxuogMLVBE/Dj8WBEdCDzwKBgQC5x9KlBPeyzdcSCvw1p3oq0CWqTwSeOW0p\n8ZYINDEDvZ6hnccNwwtMc65/G/4xhEjD9mpCKvQnxBD+qzB8JuvUhjPtzck0Skj+\no8s7GxKdzn07IjA6FyShSN7tzxLHherOoA6CUdI4Aw9EWK2tkAfBecN4qgHTCMOd\nG1bTubD81wKBgA0p22DeYntepYFuwW3mxOItmzXpMkIcFwncyeg7pCmJKelAkAzP\nOYYCC7/XN8rWAt17OFLjcHsozSFDdSn9nivJONdwv1CncjX1fWvkpWByhp/SYL+C\nSTEHx/LPys2na/nI4K42Ws3cVBvqGnmIacbiJGiR6ScnzpZvofGdV5pxAoGATbbo\nR/2e/F4dBMAxpuQrN7OgvfCWFvYg0zXrM/1ZL55nuGW++ePIWy/dI/AkpGQY6Fix\nNIKxZd0f2tiTzKufZWTKXkUCUOxuQo8UGeKGVBsnyc/Qasx5lzpbfxFrYqmDgvHz\nf9JoZOPqxAVwibVBeU7NVTGQ183HvnXMSX9ZKTsCgYBDvyqgMAqPRGSAmYQ1T5ZJ\nNeUvu0QhxorZ0xV3X7AvEKAnoa4Z2jFnvq1tZMXr0bpDHEzqNK/f6um78TwP7z7h\nT7aFKSYT/2aYFgvSdXxPVoCHj33NApnYPHVD7NGltvMCQbO34aA3qyWEJoHDQKSs\ndk5yvqVdqBoJ7hZg7HMe3w==\n-----END PRIVATE KEY-----\n"
```

### 3. Advanced Settings
- **Auto-Deploy**: `Yes` (recommended)
- **Pull Request Previews**: `Yes` (optional)

## 🔧 Google Sheets Setup Requirements

### Step 1: Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `chouieur-express-sheets`
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Sheets API"
5. Click **ENABLE** (if not already enabled)

### Step 2: Share Google Sheet
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
2. Click **Share** button (top right)
3. Add email: `chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com`
4. Set permission to **Editor**
5. Click **Send**

### Step 3: Create Sheet Structure
Your Google Sheet should have these sheets:
- **Sheet1** - General data storage
- **MenuItems** - Menu items with columns: Name, Price, Category, Description, Image
- **Orders** - Orders with columns: Timestamp, Customer Name, Items, Total, Status, Email

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - Server health status
- **GET** `/api/test-sheets` - Test Google Sheets connection

### Data Management
- **GET** `/api/data?range=Sheet1!A1:Z100` - Read data from sheet
- **POST** `/api/data` - Add new row to sheet

### Menu Items
- **GET** `/api/menu-items` - Get all menu items
- **POST** `/api/menu-items` - Add new menu item

### Orders
- **GET** `/api/orders` - Get all orders
- **POST** `/api/orders` - Create new order

## 🧪 Testing Your Backend

### Local Testing
```bash
# Install dependencies
npm install

# Start backend server
npm run backend

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/test-sheets
```

### Production Testing
After deployment, test your backend:
```bash
# Replace with your actual Render URL
curl https://your-backend-service.onrender.com/api/health
curl https://your-backend-service.onrender.com/api/test-sheets
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Port scan timeout reached, no open ports detected"**
   - ✅ **FIXED**: The server uses `process.env.PORT || 3000` for dynamic port detection
   - Render will automatically assign and detect the port

2. **"Google Sheets not initialized"**
   - Check that all Google Sheets environment variables are set
   - Verify the Google Sheets API is enabled
   - Ensure the service account has access to the sheet

3. **"Method doesn't allow unregistered callers"**
   - Enable Google Sheets API in Google Cloud Console
   - Share the Google Sheet with the service account email
   - Verify the service account credentials are correct

4. **CORS Errors**
   - Set `FRONTEND_URL` environment variable to your frontend URL
   - Ensure the frontend URL matches exactly (including https/http)

5. **Build Failures**
   - All dependencies are in the main `dependencies` section
   - No build step required for backend (just `npm ci`)

## 🎉 Expected Results

After deployment, you should have:
- ✅ Backend server running on Render
- ✅ Google Sheets connection working
- ✅ All API endpoints responding
- ✅ CORS configured for frontend
- ✅ Health check endpoint working

## 📞 Support

If you encounter any issues:
1. Check the build logs in Render dashboard
2. Verify all environment variables are set correctly
3. Test the Google Sheets connection endpoint
4. Ensure the Google Sheet is shared with the service account

---

**Last Updated**: October 16, 2025
**Backend**: Express.js with Google Sheets integration
**Database**: Google Sheets API
