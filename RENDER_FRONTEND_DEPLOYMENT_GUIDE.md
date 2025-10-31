# 🚀 Frontend Deployment Guide for Render

## ✅ Pre-Deployment Checklist

Your frontend is **already configured** for Render! Here's what's ready:

- ✅ `render.yaml` - Frontend service configured
- ✅ `package.json` - Build and start scripts ready
- ✅ `next.config.ts` - Render-compatible settings
- ✅ Environment variables setup

## 📋 Step-by-Step Deployment Instructions

### **Option 1: Deploy Using render.yaml (Automatic - Recommended)**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in to your account

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - It will create BOTH backend and frontend services

3. **Review Services**
   - Render will show you two services:
     - `chouieur-express-backend`
     - `chouieur-express-frontend`
   - Click "Apply" to deploy both

4. **Wait for Deployment** (5-10 minutes)
   - Both services will build and deploy automatically
   - Monitor the build logs in Render dashboard

### **Option 2: Manual Deployment (If Blueprint doesn't work)**

1. **Create Frontend Service Manually**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service Settings:**
   ```
   Name: chouieur-express-frontend
   Region: Oregon (US West)
   Branch: master (or main)
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

3. **Add Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
   
   ```
   NODE_ENV = production
   PORT = (Render sets this automatically)
   NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
   ```
   
   **Important:** Update `NEXT_PUBLIC_API_URL` with your actual backend URL after backend deploys.

4. **Save and Deploy**
   - Click "Create Web Service"
   - Render will start building

## 🔧 Post-Deployment Configuration

### **Step 1: Get Your Frontend URL**
After deployment completes, Render will provide:
- URL: `https://chouieur-express-frontend.onrender.com` (or similar)

### **Step 2: Update Backend CORS**
1. Go to your **backend service** in Render dashboard
2. Click "Environment" tab
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://chouieur-express-frontend.onrender.com
   ```
   (Use your actual frontend URL from Step 1)
4. Click "Save Changes"
5. Render will automatically redeploy backend

### **Step 3: Update Frontend API URL**
1. Go to your **frontend service** in Render dashboard
2. Click "Environment" tab
3. Verify `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
   ```
   (Use your actual backend URL)
4. Click "Save Changes"
5. Render will automatically redeploy frontend

## 🧪 Testing Your Deployment

### **Test 1: Frontend Loads**
- Visit: `https://chouieur-express-frontend.onrender.com`
- Should see your homepage

### **Test 2: API Connection**
- Open browser console (F12)
- Check for any API errors
- Visit: `/menu` page to test menu loading

### **Test 3: Backend Connection**
- Visit: `https://chouieur-express-backend.onrender.com/api/health`
- Should return JSON with status: "OK"

## 📝 Important Notes

### **Build Time**
- First build: 5-10 minutes
- Subsequent builds: 3-5 minutes

### **Free Tier Limitations**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading for always-on service

### **Environment Variables**
- `NEXT_PUBLIC_API_URL` - Must be set for API calls to work
- `NODE_ENV` - Should always be `production`
- `PORT` - Render sets this automatically

## 🐛 Troubleshooting

### **Build Fails**
1. Check build logs in Render dashboard
2. Common issues:
   - Missing dependencies (check package.json)
   - TypeScript errors (should be ignored per config)
   - Memory issues (free tier has limits)

### **Frontend Shows Blank Page**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Check if backend is running and accessible

### **API Calls Fail (CORS Errors)**
1. Verify backend `FRONTEND_URL` matches frontend URL
2. Check backend CORS configuration
3. Check browser network tab for actual error

### **504 Gateway Timeout**
- This is normal on free tier
- Service might be spinning up
- Wait 30-60 seconds and refresh

## 🔗 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Backend Service:** https://dashboard.render.com/web/chouieur-express-backend
- **Frontend Service:** https://dashboard.render.com/web/chouieur-express-frontend

## ✅ Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create services in Render (via Blueprint or manual)
- [ ] Set environment variables
- [ ] Wait for first deployment
- [ ] Update `FRONTEND_URL` in backend
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend (if needed)
- [ ] Test frontend loads
- [ ] Test API connection
- [ ] Test menu page loads data

## 🎉 Success!

Once everything is deployed:
- Frontend: `https://chouieur-express-frontend.onrender.com`
- Backend: `https://chouieur-express-backend.onrender.com`
- Both services running and connected!

---

**Need Help?** Check Render logs or contact Render support.

