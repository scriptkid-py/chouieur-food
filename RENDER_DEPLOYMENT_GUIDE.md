# 🚀 Render Deployment Guide for Chouieur Express

This comprehensive guide will walk you through deploying your Chouieur Express application to Render with separate frontend and backend services.

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ MongoDB Atlas account and cluster
- ✅ Render account (free tier available)
- ✅ Your MongoDB Atlas connection string

## 🏗️ Project Structure

```
chouieur-express/
├── client/                 # Frontend (Next.js)
│   ├── src/               # React components and pages
│   ├── package.json       # Frontend dependencies
│   ├── Dockerfile         # Frontend container
│   └── env.example        # Frontend environment variables
├── server/                # Backend (Express + MongoDB)
│   ├── server.js          # Express server entry point
│   ├── db.js              # MongoDB connection
│   ├── package.json       # Backend dependencies
│   ├── Dockerfile         # Backend container
│   └── env.example        # Backend environment variables
├── docker-compose.yml     # Local development setup
└── README.md              # Project documentation
```

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure all files are committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "feat: prepare for Render deployment"
   git push origin main
   ```

2. **Verify your MongoDB Atlas connection string:**
   ```
   mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
   ```

### Step 2: Create Backend Service on Render

1. **Go to Render Dashboard:**
   - Visit [render.com](https://render.com)
   - Sign in to your account
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository:**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account if not already connected
   - Select your `chouieur-express` repository

3. **Configure Backend Service:**
   ```
   Name: chouieur-express-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables:**
   Click "Advanced" → "Add Environment Variable":
   ```
   MONGO_URI = mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
   NODE_ENV = production
   CLIENT_URL = https://chouieur-express-frontend.onrender.com
   ```

5. **Deploy Backend:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://chouieur-express-backend.onrender.com`)

### Step 3: Create Frontend Service on Render

1. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Select the same GitHub repository

2. **Configure Frontend Service:**
   ```
   Name: chouieur-express-frontend
   Environment: Node
   Region: Same as backend
   Branch: main
   Root Directory: client
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://chouieur-express-backend.onrender.com
   NODE_ENV = production
   ```

4. **Deploy Frontend:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://chouieur-express-frontend.onrender.com`)

### Step 4: Update Backend CORS Configuration

1. **Update Backend Environment Variable:**
   - Go to your backend service on Render
   - Navigate to "Environment" tab
   - Update `CLIENT_URL` to your actual frontend URL:
   ```
   CLIENT_URL = https://chouieur-express-frontend.onrender.com
   ```

2. **Redeploy Backend:**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete

### Step 5: Test Your Deployment

1. **Test Backend Health:**
   ```
   GET https://chouieur-express-backend.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "OK",
     "message": "Chouieur Express API is running",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "environment": "production"
   }
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Check browser console for any API connection errors
   - Test the application functionality

## 🔧 Environment Variables Reference

### Backend Service Environment Variables:
```env
MONGO_URI=mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb
NODE_ENV=production
CLIENT_URL=https://chouieur-express-frontend.onrender.com
PORT=5000
```

### Frontend Service Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://chouieur-express-backend.onrender.com
NODE_ENV=production
```

## 🐳 Local Development with Docker

If you want to test locally with the same setup:

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

1. **Make changes to your code**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin main
   ```
3. **Render will automatically deploy both services**

## 🚨 Troubleshooting

### Common Issues:

1. **Backend not connecting to MongoDB:**
   - Verify `MONGO_URI` is correct
   - Check MongoDB Atlas network access settings
   - Ensure your IP is whitelisted (or use 0.0.0.0/0 for all IPs)

2. **Frontend not connecting to backend:**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration in backend
   - Ensure backend is running and accessible

3. **Build failures:**
   - Check Render build logs
   - Verify all dependencies are in package.json
   - Ensure build commands are correct

4. **Environment variables not working:**
   - Variables must be set in Render dashboard
   - Frontend variables must start with `NEXT_PUBLIC_`
   - Restart services after changing environment variables

### Debug Commands:

1. **Check backend health:**
   ```bash
   curl https://chouieur-express-backend.onrender.com/api/health
   ```

2. **View Render logs:**
   - Go to your service dashboard
   - Click "Logs" tab
   - Check for error messages

## 📊 Monitoring and Maintenance

1. **Monitor Performance:**
   - Use Render's built-in metrics
   - Set up uptime monitoring
   - Monitor MongoDB Atlas performance

2. **Regular Maintenance:**
   - Update dependencies regularly
   - Monitor Render service limits
   - Backup MongoDB data

## 🎉 Success Checklist

- [ ] Backend service deployed and accessible
- [ ] Frontend service deployed and accessible
- [ ] MongoDB Atlas connection working
- [ ] API endpoints responding correctly
- [ ] Frontend can communicate with backend
- [ ] CORS configured properly
- [ ] Environment variables set correctly
- [ ] Health checks passing
- [ ] Application fully functional

## 🔗 Your Deployed URLs

After successful deployment, you'll have:

- **Frontend:** `https://chouieur-express-frontend.onrender.com`
- **Backend:** `https://chouieur-express-backend.onrender.com`
- **API Health:** `https://chouieur-express-backend.onrender.com/api/health`

## 📞 Support

If you encounter issues:

1. Check Render documentation: [render.com/docs](https://render.com/docs)
2. Review MongoDB Atlas documentation
3. Check your service logs in Render dashboard
4. Verify environment variables are set correctly

---

**🎊 Congratulations! Your Chouieur Express application is now live on Render!**
