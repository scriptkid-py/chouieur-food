# 🔧 Google Sheets Connection Fix Guide

## Current Status
✅ Backend server is running successfully  
✅ Frontend builds and runs successfully  
❌ Google Sheets connection has authentication issues  

## Error Details
```
Error: error:1E08010C:DECODER routines::unsupported
Code: ERR_OSSL_UNSUPPORTED
```

## 🔍 Troubleshooting Steps

### 1. Verify Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `chouieur-express-sheets`
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Sheets API" and ensure it's **ENABLED**
5. If not enabled, click **ENABLE**

### 2. Check Service Account Permissions
1. Go to **IAM & Admin** → **Service Accounts**
2. Find your service account: `chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com`
3. Click on it → **Keys** tab
4. Verify the key exists and is active

### 3. Share Google Sheet with Service Account
1. Open your Google Sheet: `13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk`
2. Click **Share** button
3. Add email: `chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com`
4. Set permission to **Editor**
5. Click **Send**

### 4. Fix Private Key Format
The private key in your `.env` file might have formatting issues. Try this:

1. **Option A: Regenerate Service Account Key**
   - Go to Google Cloud Console → IAM & Admin → Service Accounts
   - Click on your service account → Keys tab
   - Delete the existing key
   - Create a new key (JSON format)
   - Download and extract the `private_key` value

2. **Option B: Fix Current Private Key**
   - The private key should be a single line with `\n` for line breaks
   - Remove any extra quotes or spaces
   - Ensure it starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----`

### 5. Test Connection
Run the diagnostic script:
```bash
node test-sheets-connection.js
```

## 🚀 Alternative: Use Mock Data
If Google Sheets continues to have issues, you can temporarily use mock data:

1. The backend will run without Google Sheets integration
2. API endpoints will return appropriate error messages
3. You can deploy to Render and fix Google Sheets later

## 📋 Environment Variables Checklist
Ensure these are set in your `.env` file:
```bash
GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your-private-key-here]\n-----END PRIVATE KEY-----\n"
```

## 🎯 Next Steps
1. Fix Google Sheets authentication (follow steps above)
2. Test locally with `node test-sheets-connection.js`
3. Deploy to Render with proper environment variables
4. Test deployed endpoints

## 📞 Support
If issues persist:
1. Check Google Cloud Console logs
2. Verify service account has "Editor" role on the sheet
3. Ensure Google Sheets API is enabled
4. Try regenerating the service account key
