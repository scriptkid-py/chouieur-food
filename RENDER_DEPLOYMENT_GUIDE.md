# 🚀 Render Deployment Guide - Clean Next.js Project

## 📋 Overview
This guide covers deploying the cleaned and organized Next.js project to Render. The project now has a proper structure with all code in the `src/` directory.

## 🏗️ Project Structure
```
.
├── package.json
├── tsconfig.json
├── jsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
├── next-env.d.ts
├── .env
├── .gitignore
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    ├── components/
    ├── lib/
    ├── hooks/
    ├── context/
    ├── firebase/
    └── ai/
```

## 🎯 Render Frontend Service Configuration

### 1. Create New Web Service
- **Name**: `chouieur-express-frontend`
- **Environment**: `Node`
- **Region**: Choose your preferred region
- **Branch**: `master`
- **Root Directory**: Leave empty (root directory)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

**🔧 Alternative Build Commands** (if you encounter issues):
- **Build Command**: `npm run render-build` (simplified for Render)
- **Start Command**: `npm run render-start` (uses dynamic port)

**⚠️ Important**: 
- The start script now uses `npm run start` which automatically uses `process.env.PORT` for Render compatibility
- Make sure to remove the `postinstall` script from package.json as it can cause build loops on Render
- Ensure all build dependencies (TypeScript, PostCSS, Tailwind) are in the main `dependencies` section

### 2. Environment Variables
Add these environment variables in Render dashboard:

```bash
# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAqfhoMTXk1wx57snyYUCOypdAhBS9X5pg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-4940927620-c4e90.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-4940927620-c4e90
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-4940927620-c4e90.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=424747215465
NEXT_PUBLIC_FIREBASE_APP_ID=1:424747215465:web:4ca1009750bc6fc50650f8

# Any other environment variables your app needs
```

### 3. Advanced Settings
- **Auto-Deploy**: `Yes` (recommended)
- **Pull Request Previews**: `Yes` (optional)

## 🔧 Backend Service (Optional)

**⚠️ IMPORTANT**: The current project is a **frontend-only** Next.js application. If you need a backend, you have two options:

### Option 1: Frontend-Only (Recommended)
- Delete any existing backend services in Render
- Deploy only the frontend service
- Use external APIs or serverless functions for backend needs

### Option 2: Add Backend Service
If you need a backend, create a separate Web Service:

#### 1. Create Backend Service
- **Name**: `chouieur-express-backend`
- **Environment**: `Node`
- **Region**: Same as frontend
- **Branch**: `master`
- **Root Directory**: `backend`
- **Build Command**: `npm ci`
- **Start Command**: `npm start`

#### 2. Backend Environment Variables
```bash
NODE_ENV=production
PORT=10000

# CORS Configuration
FRONTEND_URL=https://your-frontend-service.onrender.com

# Add your other environment variables here
# GOOGLE_SHEETS_ID=your_google_sheets_id
# GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## 📝 Deployment Steps

### Step 1: Clean Up Render Services
1. Go to your Render dashboard
2. **Delete the old backend service** that's looking for `/opt/render/project/src/src/server`
3. Keep only your frontend service

### Step 2: Update Frontend Service
1. Find your existing frontend service
2. Update the configuration:
   - **Root Directory**: Leave **EMPTY** (not `src/client` or `src/server`)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### Step 3: Update Environment Variables
1. Go to your frontend service settings
2. Update the environment variables
3. If you have a backend, make sure `NEXT_PUBLIC_API_URL` points to your backend service

### Step 4: Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Or push a new commit to trigger auto-deploy

## 🔍 Troubleshooting

### Common Issues:

1. **"Port scan timeout reached, no open ports detected"**
   - ✅ **FIXED**: The start script now uses `npm run start` with dynamic port (`${PORT:-3000}`)
   - This ensures Render can detect the open port properly
   - The app will automatically use Render's assigned port

2. **Build Fails with "TypeScript not found"**
   - ✅ **Fixed**: TypeScript is now in dependencies (not devDependencies)
   - The `postinstall` script has been removed to prevent build loops

3. **Build Fails with "Module not found"**
   - ✅ **Fixed**: The new structure eliminates double `src` nesting
   - All imports now use `@/` aliases correctly

4. **"Could not find a production build in the '.next' directory"**
   - ✅ **Fixed**: All build dependencies moved to main dependencies
   - Build verification script added to ensure build integrity
   - Use `npm run render-build` and `npm run render-start` for enhanced verification

5. **Environment Variables Not Loading**
   - Make sure all `NEXT_PUBLIC_` variables are set
   - Check that variable names match exactly

6. **API Calls Failing**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend

7. **Build Timeout**
   - The cleaned structure should build faster
   - If still slow, consider upgrading Render plan

## 🎉 Expected Results

After deployment, you should have:
- ✅ Clean, fast builds (no more double src nesting)
- ✅ Proper module resolution with `@/` aliases
- ✅ All components loading correctly
- ✅ API calls working between frontend and backend
- ✅ Production-ready Next.js application

## 📞 Support

If you encounter any issues:
1. Check the build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure the backend service is running
4. Check that the frontend can reach the backend URL

---

**Last Updated**: October 16, 2025
**Project Structure**: Clean Next.js with proper `src/` organization
