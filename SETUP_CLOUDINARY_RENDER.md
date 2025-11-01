# ☁️ Setup Cloudinary on Render - Quick Guide

## Step 1: Get Your Cloudinary Credentials

If you already have Cloudinary credentials, skip to Step 2.

1. Go to https://cloudinary.com
2. Sign up (free tier available)
3. Go to Dashboard → Settings
4. Find these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 2: Add to Render Environment Variables

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   
2. **Select your backend service:**
   - Find `chouieur-express-backend` or similar
   
3. **Go to Environment tab:**
   - Click on the **Environment** tab in your service settings
   
4. **Add 3 environment variables:**
   
   Click **Add Environment Variable** for each:
   
   | Key | Value |
   |-----|-------|
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name from Cloudinary |
   | `CLOUDINARY_API_KEY` | Your API key from Cloudinary |
   | `CLOUDINARY_API_SECRET` | Your API secret from Cloudinary |
   
5. **Save Changes:**
   - Click **Save Changes** button
   - Render will automatically redeploy your service
   
6. **Wait for deployment:**
   - Check the **Logs** tab to see deployment progress
   - Look for: `✅ Image uploaded to Cloudinary` in logs

## Step 3: Test It!

1. Go to your admin page: `https://chouieur-express-frontend.vercel.app/admin/menu`
2. Add a menu item with an image
3. Check Render logs - you should see:
   ```
   ☁️ Uploading to Cloudinary...
   ✅ Image uploaded to Cloudinary: https://res.cloudinary.com/...
   ```
4. The image URL in your menu should now be a Cloudinary URL (not `/uploads/...`)

## ✅ Success!

Once Cloudinary is configured:
- ✅ Images upload to Cloudinary
- ✅ Images persist permanently
- ✅ Images load faster (CDN)
- ✅ Images are automatically optimized

---

## 🔒 Security Note

**Never commit your Cloudinary credentials to git!**

If you accidentally added them to a file:
1. Remove them from the file
2. Change your Cloudinary API secret (go to Cloudinary dashboard → Settings)
3. Add the new secret to Render

