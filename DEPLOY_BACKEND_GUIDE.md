# 🚀 Backend Deployment Guide

## Problem
Your frontend is getting a 502 Bad Gateway error because it's trying to connect to a backend service that isn't deployed yet.

## Solution
You need to deploy your backend service (`index.js`) to Render.

## Quick Fix - Deploy Backend Service

### Step 1: Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Sign in to your account
3. Click "New +" → "Web Service"

### Step 2: Connect Repository
1. Connect your GitHub repository: `scriptkid-py/chouieur-food`
2. Select the repository

### Step 3: Configure Backend Service
Use these exact settings:

**Basic Settings:**
- **Name:** `chouieur-express-backend`
- **Environment:** `Node`
- **Region:** `Oregon (US West)`
- **Branch:** `master`
- **Root Directory:** Leave empty
- **Build Command:** `npm ci`
- **Start Command:** `node index.js`

**Advanced Settings:**
- **Health Check Path:** `/api/health`
- **Plan:** `Free`

### Step 4: Environment Variables
Add these environment variables:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://chouieur-express-frontend.onrender.com
GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-express-service@chouieur-express-sheets-475416.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEuQIBADANBgkqhkiG9w0BAQEFAASCBKMwggSfAgEAAoIBAQCkeNCzJg/NQnLI
fEamr0qBMs8xHotTyyeBESFahBO+3M0PwyQhxJMkXDcDbSo3TTHho6TdsMtdtHpm
ht/e0RO/DNqkCWhsWSVLBcjnX0OjU9lC5bCDw8H5GOBmDBsHhAHN4fTpVfTaLdou
15mw8dyiuGZQpPe0hNzrnvddB+7dPfFuY9Kn2gY+8RxvCIUKOzSMBkZksZI7+Bcs
Acr3GZ1rhIqR+jSFLApfVREKlxjM2qzqGQ9aOs63lWIFGGgI2Qb7xfC8P+rgDabD
of15FP/ftwsOBghtuqqnT/qABHrE7Vzd3Py1KlsdFLwQBua1+ULkSuq8tmWnJFew
XIIyASwnAgMBAAECgf8gR+oftN8Ixr7Vnu9DMOFRTDZaIiawLjficSInVlwUQ/JX
4n+mSwPEbuwRu+XY00FPNk0hV3zeXO5yomr6N3f4cHAMQAc2awFxTzelq48Qe0cx
myqx17X7sDow6qTY+o28beiCUMWP4xOsk3ZLWXBdg9w0uOThE/PKfY6u6kzNrhIO
ofJIIQabdnU5UxQtXywxJVbqX3j7bhQ+xQ2ydYm29k3EJn4T/bwPCFNXSbTH8Qv5
7Ql5JdZTbMemOuO9hmKLi19czcIlzgAVSNutgC8HeJZc4L01AlKzvB8tqUj86A8U
c393PsuX2rJJWdvpgcu+9iNuelNbatwpA/w3oJECgYEA5Tl3v3KIm/X02uiLu1eU
osGohDYYLAKC92p8IBOKoGnQNjYnHfcgFLtY0YXY4h0zhUh4xfdwE3ZIEJLAKViq
TQW9np0UnmsZCxQOJoAw32+3QC8UwjaLk5KI+YtOQZpqNaUShGg2GnXQbu25mxm6
QA5LKHxoIy8SldZkLhlWHJkCgYEAt68K9ekCwX20mDuBgnwnFXmQK/HBbzCZZTtm
1DF2p5hWxb9+PxG4uNTyhcexnKbBrISy7aXWrjv1FFi8Zm3smwjZ4kGvZtjnfhr1
BsXIr2cmlIIdsNwsY6P52SPBTyqJ2NzSYlbdik8Y5ZlU/VglmqVfJbrefUaDPt3c
hpxwRr8Cf3x1t487oPENmuVBXp1Z8FpuzBD9TiKXOoUcTEkeUybGTUciIBslE0Yu
cwtQoXIkaNT1hJ34u+HVV0uoYq4QdmdbtplosMlTXUWmnghJkj+/aMBwz9SjySVX
awgTm2oDbaey+VrrOnUjgwi4Cw8r6PTezfAtnF1+MZkpzzs4hokCgYBTNUBJ1Zwh
+sfsjkhEy+kImWDuBz4RGHrkmNwkE6Qkl6X3Pp/6AhUj5ZNXdvbGd+QUOqizbwSp
OQ/0f54Y6ILeWEwbapYCiQ+U2LFWuBIJIzke3TKGA7c4C/gKnV/cdPCtBJtpYOBK
3znwCF2vxlaCj5diiBxxs5eQywAzGnriEQKBgQCy+HLduJ6XvuiYZ53GGKW8/Qhx
9dWHATY6tJc7n6UycmbkMBj4tis6bWzNejkJft9XJN1YYnH2HdJigMuovTym217c
uNOJe+VuetvNfbEpoI0ZiGrrqpU5qc2A3hahlmCk9SmaaFZOZNrjotOWOfjx8zdG
b2WYwFhEXv6wgakMHQ==
-----END PRIVATE KEY-----
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Your backend will be available at: `https://chouieur-express-backend.onrender.com`

## Alternative: Use render.yaml (Automatic)

If you want to deploy both services automatically, you can use the `render.yaml` file I created. Just:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically create both services

## Verification

After deployment:

1. **Check Backend Health:** Visit `https://chouieur-express-backend.onrender.com/api/health`
2. **Check Frontend:** Visit `https://chouieur-express-frontend.onrender.com`
3. **Test Admin Login:** Go to `/admin` and login with `admin`/`admin123`

## Expected URLs

- **Frontend:** `https://chouieur-express-frontend.onrender.com`
- **Backend:** `https://chouieur-express-backend.onrender.com`
- **Admin Panel:** `https://chouieur-express-frontend.onrender.com/admin`

## Troubleshooting

If you still get 502 errors:

1. **Check Backend Logs:** Go to your backend service in Render dashboard
2. **Verify Environment Variables:** Make sure all are set correctly
3. **Check Health Endpoint:** Visit `/api/health` on your backend URL
4. **Wait for Deployment:** Backend deployment can take 5-10 minutes

## Next Steps

Once both services are running:

1. ✅ Frontend will load without 502 errors
2. ✅ Admin panel will be accessible
3. ✅ Menu management will work
4. ✅ Image uploads will function
5. ✅ All API calls will succeed

---

**🎯 The key issue:** You only deployed the frontend, but your app needs both frontend AND backend services running!
