# 🚀 Render Deployment Instructions - Chouieur Express

## 📋 Overview
This guide will help you deploy both your frontend (Next.js) and backend (Express.js) to Render using the `render.yaml` configuration.

## 🎯 Quick Deployment Steps

### Step 1: Prepare Your Repository
1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically detect the `render.yaml` file**
5. **Click "Apply" to deploy both services**

#### Option B: Manual Deployment
If you prefer to deploy manually:

**Backend Service:**
1. **New +** → **Web Service**
2. **Connect your repository**
3. **Configure:**
   - **Name:** `chouieur-express-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm ci`
   - **Start Command:** `node index.js`
   - **Health Check Path:** `/api/health`

**Frontend Service:**
1. **New +** → **Web Service**
2. **Connect your repository**
3. **Configure:**
   - **Name:** `chouieur-express-frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`

### Step 3: Environment Variables

The `render.yaml` file already includes all necessary environment variables, but you can verify them in the Render dashboard:

**Backend Environment Variables:**
- `NODE_ENV=production`
- `PORT=10000`
- `FRONTEND_URL=https://chouieur-express-frontend.onrender.com`
- `GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-express-service@chouieur-express-sheets-475416.iam.gserviceaccount.com`
- `GOOGLE_PRIVATE_KEY=[Your private key]`

**Frontend Environment Variables:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://chouieur-express-backend.onrender.com`
- `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAqfhoMTXk1wx57snyYUCOypdAhBS9X5pg`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-4940927620-c4e90.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-4940927620-c4e90`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-4940927620-c4e90.appspot.com`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=424747215465`
- `NEXT_PUBLIC_FIREBASE_APP_ID=1:424747215465:web:4ca1009750bc6fc50650f8`

## 🔍 Testing Your Deployment

### Test Backend
```bash
curl https://chouieur-express-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Chouieur Express Backend is running",
  "timestamp": "2025-10-19T...",
  "port": "10000",
  "environment": "production"
}
```

### Test Frontend
Visit: `https://chouieur-express-frontend.onrender.com`

You should see your React application with the Chouieur Food & Helado interface.

## 🚨 Troubleshooting

### Common Issues:

1. **Backend shows Next.js instead of Express:**
   - ✅ **Fixed:** The `render.yaml` explicitly sets `startCommand: node index.js`

2. **Frontend build fails:**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript configuration

3. **API calls fail:**
   - Ensure `NEXT_PUBLIC_API_URL` points to your backend URL
   - Check CORS settings in backend

4. **Environment variables not loading:**
   - Verify all `NEXT_PUBLIC_` variables are set
   - Check variable names match exactly

## 📊 Expected URLs

After deployment:
- **Frontend:** `https://chouieur-express-frontend.onrender.com`
- **Backend:** `https://chouieur-express-backend.onrender.com`
- **Backend Health:** `https://chouieur-express-backend.onrender.com/api/health`

## 🎉 Success Indicators

✅ **Backend Success:**
- Health endpoint returns JSON with status "OK"
- Google Sheets integration working
- CORS properly configured

✅ **Frontend Success:**
- React application loads
- No console errors
- API calls to backend working
- Firebase authentication working

## 📞 Support

If you encounter issues:
1. Check the build logs in Render dashboard
2. Verify environment variables are set correctly
3. Test backend health endpoint first
4. Check browser console for frontend errors

---

**Ready to deploy?** Just commit your changes and use the Blueprint option in Render!
