# 🚨 Render Next.js Override Issue Fix

## ❌ Current Problem
Render is detecting your project as a Next.js app and overriding the start command:
```
==> Running build command 'npm start'...
> chouieur-express-client@0.1.0 start
> next start -p ${PORT:-3000}  ❌ WRONG!
```

Instead of running:
```
> node index.js  ✅ CORRECT!
```

## ✅ Solution Options

### Option 1: Use Different Start Command (Recommended)

1. **Go to Render Dashboard** → Your Backend Service → **Settings**
2. **Change Start Command** from `npm start` to:
   ```
   node index.js
   ```
3. **Save and redeploy**

### Option 2: Create Backend-Only Package.json

Create a separate `package.json` for the backend by adding this to your root directory:

```json
{
  "name": "chouieur-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "googleapis": "^163.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### Option 3: Modify Current Package.json

Update your current `package.json` to make the backend start command more explicit:

```json
{
  "scripts": {
    "start": "node index.js",
    "start:backend": "node index.js",
    "start:frontend": "next start",
    "render-start": "node index.js"
  }
}
```

Then in Render, use **Start Command**: `npm run render-start`

## 🎯 Quick Fix (Recommended)

**Go to Render Dashboard:**
1. Navigate to your backend service
2. Click **Settings**
3. Change **Start Command** from `npm start` to:
   ```
   node index.js
   ```
4. **Save Changes**
5. **Manual Deploy** → **Deploy latest commit**

## Expected Result

After the fix, you should see:
```
==> Running build command 'npm start'...
> chouieur-express-client@0.1.0 start
> node index.js  ✅
🚀 Starting Chouieur Express Backend...
✅ Google Sheets authentication successful
🌐 Server running on port 10000
```

## Why This Happened

Render's auto-detection system saw:
- `next.config.ts` file
- Next.js dependencies in `package.json`
- Assumed it was a Next.js app
- Overrode the start command to `next start`

## Alternative: Remove Next.js Files for Backend

If you want a clean backend-only deployment, you could:
1. Create a separate backend repository
2. Copy only the backend files (`index.js`, backend dependencies)
3. Deploy that as a separate Render service

But the quickest fix is to change the Start Command to `node index.js` in Render settings.
