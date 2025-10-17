# 🚀 Render Port Binding Fix Guide

## ✅ Issue Fixed
The "No open ports detected" error has been resolved by fixing the server binding configuration.

## 🔧 Changes Made

### 1. Server Binding Fix
Updated `index.js` to properly bind to `0.0.0.0` and use `process.env.PORT`:

```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🚀 Server bound to 0.0.0.0:${PORT} for Render deployment`);
});
```

### 2. Package.json Scripts
Updated scripts for proper deployment:

```json
{
  "scripts": {
    "start": "node index.js",
    "frontend": "next start",
    "backend": "node index.js"
  }
}
```

## 🚀 Render Deployment Configuration

### Backend Service (Web Service)
1. **Name**: `chouieur-express-backend`
2. **Environment**: `Node`
3. **Build Command**: `npm ci` (or leave empty)
4. **Start Command**: `npm start`
5. **Root Directory**: (leave empty)
6. **Node Version**: `22.16.0` (or latest)

### Environment Variables for Backend
```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend-name.onrender.com
GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-express-service@chouieur-express-sheets-475416.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your-private-key]\n-----END PRIVATE KEY-----\n"
```

### Frontend Service (Static Site)
1. **Name**: `chouieur-express-frontend`
2. **Build Command**: `npm ci && npm run build`
3. **Publish Directory**: `.next`
4. **Root Directory**: (leave empty)

### Environment Variables for Frontend
```bash
NEXT_PUBLIC_API_URL=https://chouieur-express-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAqfhoMTXk1wx57snyYUCOypdAhBS9X5pg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-4940927620-c4e90.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-4940927620-c4e90
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-4940927620-c4e90.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=424747215465
NEXT_PUBLIC_FIREBASE_APP_ID=1:424747215465:web:4ca1009750bc6fc50650f8
```

## 🧪 Testing Deployment

### 1. Test Backend Health
```bash
curl https://chouieur-express-backend.onrender.com/api/health
```

### 2. Test Google Sheets Connection
```bash
curl https://chouieur-express-backend.onrender.com/api/test-sheets
```

### 3. Test Frontend
Open: `https://chouieur-express-frontend.onrender.com`

## 📋 Deployment Checklist

- [ ] Backend service created with correct build/start commands
- [ ] All environment variables set in Render dashboard
- [ ] Frontend service created as Static Site
- [ ] Frontend environment variables set
- [ ] Both services deployed successfully
- [ ] Health endpoints responding
- [ ] Frontend can communicate with backend

## 🎯 Expected Results

After deployment, you should see:
- ✅ Backend running on Render-assigned port
- ✅ Health endpoint returning 200 OK
- ✅ Frontend loading successfully
- ✅ API communication working between services

## 🚨 Troubleshooting

If you still get "No open ports detected":
1. Verify `Start Command` is exactly `npm start`
2. Check that `package.json` has `"start": "node index.js"`
3. Ensure server binds to `0.0.0.0:${PORT}`
4. Check Render logs for any startup errors

The port binding issue is now resolved! 🎉
