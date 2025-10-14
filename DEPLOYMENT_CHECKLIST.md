# 🚀 Render Deployment Checklist

## ✅ Pre-Deployment Setup
- [x] Code is ready and configured
- [x] MongoDB Atlas connection string available
- [x] Environment variables documented
- [x] Build scripts configured

## 🎯 Step-by-Step Deployment

### 1. Backend Service Setup
**Go to:** [render.com/dashboard](https://render.com/dashboard)

**Create New Web Service:**
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository: `scriptkid-py/chouieur-food`
- [ ] Configure service:
  ```
  Name: chouieur-express-backend
  Environment: Node
  Region: US East (or closest to you)
  Branch: master
  Root Directory: server
  Build Command: npm install
  Start Command: npm start
  ```
- [ ] Add Environment Variables:
  ```
  MONGO_URI = mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
  NODE_ENV = production
  CLIENT_URL = https://chouieur-express-frontend.onrender.com
  ```
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] **Note Backend URL:** `https://chouieur-express-backend.onrender.com`

### 2. Frontend Service Setup
**Create Another Web Service:**
- [ ] Click "New +" → "Web Service"
- [ ] Select same repository: `scriptkid-py/chouieur-food`
- [ ] Configure service:
  ```
  Name: chouieur-express-frontend
  Environment: Node
  Region: Same as backend
  Branch: master
  Root Directory: client
  Build Command: npm ci && npm run build
  Start Command: npm start
  ```
- [ ] Add Environment Variables:
  ```
  NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
  NODE_ENV = production
  ```
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (10-15 minutes)
- [ ] **Note Frontend URL:** `https://chouieur-express-frontend.onrender.com`

### 3. Update Backend CORS
- [ ] Go to backend service dashboard
- [ ] Navigate to "Environment" tab
- [ ] Update CLIENT_URL to actual frontend URL:
  ```
  CLIENT_URL = https://chouieur-express-frontend.onrender.com
  ```
- [ ] Save changes (triggers redeploy)

### 4. Test Deployment
- [ ] Test backend health: `https://chouieur-express-backend.onrender.com/api/health`
- [ ] Test frontend: `https://chouieur-express-frontend.onrender.com`
- [ ] Check browser console for errors
- [ ] Test application functionality

## 🔧 Troubleshooting

### If Backend Fails to Deploy:
- Check build logs in Render dashboard
- Verify MONGO_URI is correct
- Ensure all dependencies are in package.json

### If Frontend Fails to Deploy:
- Check build logs for Next.js errors
- Verify build command: `npm ci && npm run build`
- Check environment variables

### If Services Can't Connect:
- Verify CORS configuration
- Check environment variables are set correctly
- Ensure both services are deployed successfully

## 📞 Need Help?
- Check Render documentation: [render.com/docs](https://render.com/docs)
- Review deployment logs in Render dashboard
- Test API endpoints individually

---

**Your MongoDB Atlas Connection String:**
```
mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
```

**Expected Final URLs:**
- Frontend: `https://chouieur-express-frontend.onrender.com`
- Backend: `https://chouieur-express-backend.onrender.com`
