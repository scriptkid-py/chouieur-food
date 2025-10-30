# Cloudinary Setup for Image Storage

## 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the dashboard

## 2. Set Environment Variables
Add these to your Render backend environment variables:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 3. Benefits of This Setup
- ✅ Images persist across deployments
- ✅ Automatic image optimization
- ✅ CDN delivery for fast loading
- ✅ Automatic fallback to data URLs if not configured
- ✅ No file system dependencies

## 4. Fallback Behavior
If Cloudinary credentials are not set, the system will automatically fall back to base64 data URLs, so your app will still work without Cloudinary.
