# 🚀 Manual Render Deployment Guide

Since the automated script is having issues, here's a step-by-step manual deployment guide:

## 📋 Prerequisites
- ✅ Your Render API key: `rnd_9TXSUJbKIfSqyIUkLcsqbSY28MYt`
- ✅ Your GitHub repo: `scriptkid-py/chouieur-food`
- ✅ MongoDB Atlas connection string ready

## 🎯 Step 1: Create Backend Service

### Go to Render Dashboard:
1. Visit: https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**

### Configure Backend:
```
Name: chouieur-express-backend
Environment: Node
Region: Oregon (or closest to you)
Branch: master
Root Directory: server
Build Command: npm install
Start Command: npm start
```

### Environment Variables:
```
MONGO_URI = mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
NODE_ENV = production
```

### Deploy:
- Click **"Create Web Service"**
- Wait for deployment (5-10 minutes)
- **Note the backend URL** (e.g., `https://chouieur-express-backend.onrender.com`)

## 🎯 Step 2: Create Frontend Service

### Create Another Web Service:
1. Click **"New +"** → **"Web Service"**
2. Select same repository

### Configure Frontend:
```
Name: chouieur-express-frontend
Environment: Node
Region: Same as backend
Branch: master
Root Directory: client
Build Command: npm ci
Start Command: npm start
```

### Environment Variables:
```
NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
NODE_ENV = production
```

### Deploy:
- Click **"Create Web Service"**
- Wait for deployment (10-15 minutes)
- **Note the frontend URL** (e.g., `https://chouieur-express-frontend.onrender.com`)

## 🎯 Step 3: Update Backend CORS

1. Go to your backend service dashboard
2. Navigate to **"Environment"** tab
3. Add new environment variable:
   ```
   CLIENT_URL = https://chouieur-express-frontend.onrender.com
   ```
4. Click **"Save Changes"** (triggers redeploy)

## 🎯 Step 4: Test Deployment

### Test Backend:
```
GET https://chouieur-express-backend.onrender.com/api/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "Chouieur Express API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Test Frontend:
- Open your frontend URL in browser
- Check browser console for errors
- Test application functionality

## 🔧 Troubleshooting

### If Backend Fails:
- Check build logs in Render dashboard
- Verify MONGO_URI is correct
- Ensure all dependencies are in package.json

### If Frontend Fails:
- Check build logs for Next.js errors
- Verify build command: `npm ci`
- Check environment variables

### If Services Can't Connect:
- Verify CORS configuration
- Check environment variables are set correctly
- Ensure both services are deployed successfully

## 📊 Expected Results

After successful deployment:
- **Backend URL:** `https://chouieur-express-backend.onrender.com`
- **Frontend URL:** `https://chouieur-express-frontend.onrender.com`
- **Health Check:** `https://chouieur-express-backend.onrender.com/api/health`

## 🎉 Success Checklist

- [ ] Backend service deployed and accessible
- [ ] Frontend service deployed and accessible
- [ ] MongoDB Atlas connection working
- [ ] API endpoints responding correctly
- [ ] Frontend can communicate with backend
- [ ] CORS configured properly
- [ ] Environment variables set correctly
- [ ] Health checks passing
- [ ] Application fully functional

---

**Your Chouieur Express app will be live on Render! 🚀**
