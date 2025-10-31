# 🧪 Frontend and Backend Connection Test

## ✅ Status

### **Frontend (Vercel)**
- **URL**: https://chouieur-express-frontend-fivrszx78-scriptkid-pys-projects.vercel.app
- **Status**: ✅ Live and Deployed
- **Framework**: Next.js 15.3.3

### **Backend (Render)**
- **URL**: https://chouieur-express-backend.onrender.com
- **Status**: ⚠️ May be sleeping (free tier)
- **Note**: First request after inactivity may take 30-60 seconds

## 🔗 API Configuration

### **Frontend → Backend Connection**
The frontend is configured to connect to:
```
https://chouieur-express-backend.onrender.com
```

### **API Endpoints**
- `GET /api/health` - Health check
- `GET /api/menu-items` - Get all menu items
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order

## 🧪 Testing Steps

### **1. Test Frontend**
```bash
# Visit in browser
https://chouieur-express-frontend-fivrszx78-scriptkid-pys-projects.vercel.app
```

### **2. Test Backend Health**
```bash
curl https://chouieur-express-backend.onrender.com/api/health
```

### **3. Test Menu Items API**
```bash
curl https://chouieur-express-backend.onrender.com/api/menu-items
```

### **4. Test in Browser Console**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit menu page
4. Check for requests to `/api/menu-items`
5. Verify response status and data

## ⚠️ Known Issues

### **Render Free Tier Limitations**
- **Spin-down**: Backend sleeps after 15 minutes of inactivity
- **Wake-up time**: First request takes 30-60 seconds
- **Solution**: Use Render paid tier for always-on service

### **CORS**
- Backend should allow Vercel frontend origins
- Check `FRONTEND_URL` environment variable in Render

## 📊 Connection Flow

```
User Browser
    ↓
Vercel Frontend (Next.js)
    ↓
API Request: GET /api/menu-items
    ↓
Render Backend (Express.js)
    ↓
Google Sheets API / MongoDB
    ↓
Response with Menu Items
    ↓
Frontend displays menu
```

## ✅ Verification Checklist

- [x] Frontend deployed on Vercel
- [x] Backend deployed on Render
- [x] API configuration points to Render backend
- [x] CORS configured correctly
- [ ] Backend responds to health check (may be sleeping)
- [ ] Menu items API returns data
- [ ] Frontend successfully fetches menu items

## 🔍 Debugging

If menu is stuck loading:
1. Check browser console for errors
2. Check Network tab for failed API requests
3. Verify backend is awake (may need to wait)
4. Check Render logs for backend errors
5. Verify environment variables in Render dashboard

