# 🔄 Clear Cache & Restart Guide

## The Problem
Changes aren't showing up - likely cache issues.

## ✅ Quick Fix Steps

### **Step 1: Clear Next.js Cache**
```bash
# Delete .next folder (Next.js build cache)
rm -rf .next
# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next
```

### **Step 2: Stop All Node Processes**
```bash
# Kill any running node processes on port 3000
# Windows:
netstat -ano | findstr :3000
# Find PID and kill it:
taskkill /PID [PID_NUMBER] /F

# Or just close the terminal where npm run dev is running
```

### **Step 3: Clear Browser Cache**
1. **Chrome/Edge:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"

2. **Or Hard Refresh:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

### **Step 4: Restart Dev Server**
```bash
npm run dev
```

### **Step 5: Verify Changes**
1. Open browser: `http://localhost:3000`
2. Look for **"Delivery"** in the navigation menu
3. Click it to go to `/delivery`

## 🌐 For Production (Render)

### **Force Rebuild on Render:**
1. Go to Render Dashboard
2. Click your frontend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait 3-5 minutes
5. Clear browser cache
6. Hard refresh (`Ctrl + Shift + R`)

### **Check Deployment Status:**
- Render Dashboard → Logs tab
- Look for build completion
- Check for any errors

## 🔍 Verify Changes Are Applied

### **Check 1: Navigation Menu**
- Should see: Home | Menu | About | Contact | **Delivery**

### **Check 2: Delivery Page**
- Visit: `http://localhost:3000/delivery`
- Should see delivery dashboard with orders table

### **Check 3: Browser Console**
- Open DevTools (F12)
- Check for errors
- Look for "Delivery" link in page source

## 🐛 If Still Not Working

### **Check File Was Saved:**
```bash
# Verify delivery link exists
grep -i "delivery" src/components/layout/Header.tsx
```

### **Rebuild from Scratch:**
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run dev
```

### **Check Git Status:**
```bash
git status
git log --oneline -3
```

## ✅ Expected Result

After clearing cache and restarting:
- ✅ "Delivery" link appears in navigation
- ✅ `/delivery` route works
- ✅ Delivery dashboard loads
- ✅ Changes reflect immediately

---

**Most common issue: Browser cache or Next.js build cache. Clear both!**

