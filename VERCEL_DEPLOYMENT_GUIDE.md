# 🚀 Vercel Deployment Guide - Frontend

## ✅ Pre-Deployment Checklist

Your project is **already configured** for Vercel! Here's what's ready:

- ✅ Next.js project (Vercel's native framework)
- ✅ `.vercelignore` configured (excludes backend files)
- ✅ `next.config.ts` optimized for Vercel
- ✅ Build scripts ready (`npm run build`)

## 📋 Step-by-Step Deployment

### **Option 1: Deploy via Vercel Dashboard (Easiest)**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in (or create account)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Import from GitHub: `scriptkid-py/chouieur-food`
   - Vercel will auto-detect it's a Next.js project

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   NODE_ENV = production
   NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-5 minutes for build
   - Your site will be live!

### **Option 2: Deploy via Vercel CLI (Advanced)**

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? (No for first time)
   - Project name: `chouieur-express-frontend`
   - Directory: `.`
   - Override settings? (No)

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter: https://chouieur-express-backend.onrender.com
   
   vercel env add NODE_ENV
   # Enter: production
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## 🔧 Important Configuration

### **Environment Variables**
Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
```

**Important**: 
- `NEXT_PUBLIC_*` variables are exposed to the browser
- After adding variables, you need to redeploy

### **Build Settings**
Vercel will auto-detect:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## ✅ After Deployment

### **1. Get Your Vercel URL**
- Vercel will give you: `https://your-project.vercel.app`
- Example: `https://chouieur-express-frontend.vercel.app`

### **2. Test All Routes**
- ✅ Homepage: `/`
- ✅ Menu: `/menu`
- ✅ Delivery: `/delivery` ⭐
- ✅ Admin: `/admin`
- ✅ Cart: `/cart`

### **3. Update Backend CORS**
If your backend is on Render, update CORS to allow Vercel domain:
- Backend `FRONTEND_URL` should include your Vercel URL
- Example: `https://your-project.vercel.app`

## 🎯 Advantages of Vercel

- ✅ **Native Next.js support** - Built by Vercel (Next.js creators)
- ✅ **Auto-deployments** - Deploys on every git push
- ✅ **Edge Network** - Fast global CDN
- ✅ **Zero configuration** - Auto-detects Next.js
- ✅ **Preview deployments** - Test before production

## 🔍 Troubleshooting

### **Build Fails**
- Check build logs in Vercel dashboard
- Verify `npm run build` works locally
- Check for TypeScript/ESLint errors

### **Routes Return 404**
- Vercel auto-detects Next.js App Router
- All routes in `src/app/` should work automatically
- Wait a few minutes after deployment

### **API Calls Fail**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS on backend allows Vercel domain
- Check browser console for errors

## 📝 Quick Deploy Commands

If you have Vercel CLI installed:

```bash
# First time
vercel login
vercel

# Update environment variables
vercel env add NEXT_PUBLIC_API_URL

# Deploy to production
vercel --prod
```

---

**Vercel is the best platform for Next.js - deployment should be smooth!** 🚀

