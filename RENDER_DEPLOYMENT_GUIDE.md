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
- **Start Command**: `npm start`

### 2. Environment Variables
Add these environment variables in Render dashboard:

```bash
# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com

# Firebase Configuration (if using Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Any other environment variables your app needs
```

### 3. Advanced Settings
- **Auto-Deploy**: `Yes` (recommended)
- **Pull Request Previews**: `Yes` (optional)

## 🔧 Backend Service (if needed)

If you need a backend service, create a separate Web Service:

### 1. Create Backend Service
- **Name**: `chouieur-express-backend`
- **Environment**: `Node`
- **Region**: Same as frontend
- **Branch**: `master`
- **Root Directory**: Leave empty
- **Build Command**: `npm ci`
- **Start Command**: `npm start`

### 2. Backend Environment Variables
```bash
NODE_ENV=production
PORT=10000

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_google_sheets_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# CORS Configuration
FRONTEND_URL=https://your-frontend-service.onrender.com
```

## 📝 Deployment Steps

### Step 1: Update Render Services
1. Go to your Render dashboard
2. Find your existing frontend service
3. Update the configuration:
   - **Root Directory**: Leave empty (was `src/client` before)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### Step 2: Update Environment Variables
1. Go to your service settings
2. Update the environment variables
3. Make sure `NEXT_PUBLIC_API_URL` points to your backend service

### Step 3: Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Or push a new commit to trigger auto-deploy

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails with "Module not found"**
   - ✅ **Fixed**: The new structure eliminates double `src` nesting
   - All imports now use `@/` aliases correctly

2. **Environment Variables Not Loading**
   - Make sure all `NEXT_PUBLIC_` variables are set
   - Check that variable names match exactly

3. **API Calls Failing**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend

4. **Build Timeout**
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
