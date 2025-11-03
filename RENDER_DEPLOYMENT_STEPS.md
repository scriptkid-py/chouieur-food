# 🚀 Render Deployment Guide - Chouieur Express

## Prerequisites
- GitHub repository: https://github.com/scriptkid-py/chouieur-food
- Render account: https://dashboard.render.com

---

## 📦 Step 1: Deploy Backend Service

### Create Backend Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `scriptkid-py/chouieur-food`
4. Configure:

```yaml
Name: chouieur-express-backend
Runtime: Node
Region: Oregon (or closest to you)
Branch: main
Root Directory: api
Build Command: npm install
Start Command: node index.js
Plan: Free
```

### Set Environment Variables (Backend)
Click **"Environment"** tab and add:

```bash
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://zaid:RrZLCt1iLTrxS5RZ@chouieur-express.657lqxf.mongodb.net/chouieur_express?retryWrites=true&w=majority&appName=chouieur-express
GOOGLE_SHEETS_ID=1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI
GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-menu@iconic-medley-476514-j3.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=(your private key from Google Service Account)
CLOUDINARY_CLOUD_NAME=(optional, for image uploads)
CLOUDINARY_API_KEY=(optional)
CLOUDINARY_API_SECRET=(optional)
```

### Health Check
- Path: `/api/health`
- Wait for deployment to complete (~5-10 minutes)
- Note your backend URL: `https://chouieur-express-backend-xxxxx.onrender.com`

---

## 🎨 Step 2: Deploy Frontend Service

### Create Frontend Service
1. Click **"New +"** → **"Web Service"** again
2. Select same repository: `scriptkid-py/chouieur-food`
3. Configure:

```yaml
Name: chouieur-express-frontend
Runtime: Node
Region: Oregon (or same as backend)
Branch: main
Root Directory: (leave empty - project root)
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free
```

### Set Environment Variables (Frontend)
Click **"Environment"** tab and add:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://chouieur-express-backend-xxxxx.onrender.com
```

⚠️ **Important**: Replace `xxxxx` with your actual backend URL from Step 1!

---

## 🔄 Step 3: Enable Auto-Deploy

For both services:
1. Go to **Settings** → **Build & Deploy**
2. Enable **"Auto-Deploy"** from main branch
3. Future git pushes will automatically trigger deployments! 🎉

---

## ✅ Step 4: Verify Deployment

### Backend Verification
Visit: `https://chouieur-express-backend-xxxxx.onrender.com/api/health`

Expected response:
```json
{
  "status": "OK",
  "message": "Chouieur Express Backend with MongoDB is running",
  "timestamp": "2025-11-03T..."
}
```

### Frontend Verification
Visit: `https://chouieur-express-frontend-xxxxx.onrender.com`

You should see your Chouieur Express homepage! 🎉

---

## 📱 Important URLs After Deployment

### Public URLs:
- **Homepage**: `https://chouieur-express-frontend-xxxxx.onrender.com`
- **Menu**: `https://chouieur-express-frontend-xxxxx.onrender.com/menu`
- **Cart**: `https://chouieur-express-frontend-xxxxx.onrender.com/cart`

### Admin/Staff URLs:
- **Admin Dashboard**: `https://chouieur-express-frontend-xxxxx.onrender.com/admin`
- **Kitchen View**: `https://chouieur-express-frontend-xxxxx.onrender.com/kitchen`
- **Delivery (Drivers Only)**: `https://chouieur-express-frontend-xxxxx.onrender.com/delivery` 🚚

---

## 🐛 Troubleshooting

### Backend Not Starting?
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend Can't Connect to Backend?
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Look for errors in browser console

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Consider upgrading to paid tier for production

---

## 🔒 Security Recommendations

1. **Change MongoDB Password** in production
2. **Set ADMIN_PASSWORD** environment variable for admin access
3. **Use HTTPS** URLs (Render provides free SSL)
4. **Rotate Google Service Account keys** periodically
5. **Enable authentication** for delivery driver page

---

## 📊 Monitoring

Check your deployments:
- **Dashboard**: https://dashboard.render.com
- **Logs**: Click service → "Logs" tab
- **Metrics**: Click service → "Metrics" tab

---

## 🎉 Your Deployment URLs

After deployment completes, you'll have:

```
Frontend: https://chouieur-express-frontend-xxxxx.onrender.com
Backend:  https://chouieur-express-backend-xxxxx.onrender.com
```

Share the frontend URL with your customers! 🍕🍔🌮

---

**Last Updated**: 2025-11-03

