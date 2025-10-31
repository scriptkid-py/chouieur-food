# 🔗 Frontend URL for Render Backend CORS Configuration

## ✅ Set This in Render Backend Environment Variables

### **Environment Variable:**
```
FRONTEND_URL=https://chouieur-express-frontend-fivrszx78-scriptkid-pys-projects.vercel.app
```

## 📋 How to Set in Render Dashboard

### **Step 1: Go to Render Dashboard**
1. Visit: https://dashboard.render.com
2. Select your backend service: `chouieur-express-backend`

### **Step 2: Add Environment Variable**
1. Go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://chouieur-express-frontend-fivrszx78-scriptkid-pys-projects.vercel.app`
4. Click **"Save Changes"**

### **Step 3: Redeploy**
After adding the environment variable, Render will automatically redeploy your service.

## 🔄 Current Production URLs

### **Frontend (Vercel):**
- **URL**: `https://chouieur-express-frontend-fivrszx78-scriptkid-pys-projects.vercel.app`
- **Project**: `chouieur-express-frontend`
- **Note**: Vercel URLs may change with each deployment, but the code also allows any `*.vercel.app` domain

### **Backend (Render):**
- **URL**: `https://chouieur-express-backend.onrender.com`

## ✅ CORS Configuration

The backend code already:
- ✅ Allows all `*.vercel.app` domains automatically
- ✅ Uses `FRONTEND_URL` environment variable if set
- ✅ Allows localhost for development

### **What You Need to Do:**
Just add the `FRONTEND_URL` environment variable in Render with your current Vercel frontend URL.

## 🧪 Test After Configuration

1. Add the environment variable in Render
2. Wait for automatic redeploy
3. Test your frontend - it should connect to backend without CORS errors
4. Check browser console for CORS errors

## 📝 Alternative: Multiple Frontend URLs

If you have multiple frontend URLs (dev, staging, prod), you can add them all:

```bash
# In Render Environment Variables, add:
FRONTEND_URL=https://chouieur-express-frontend-fivrszx78-scriptkid-pys-projects.vercel.app,https://chouieur-express-frontend.vercel.app
```

**Note**: The backend code already allows all `*.vercel.app` domains, so adding this is optional but recommended for explicit configuration.

