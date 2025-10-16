# 🔧 Google Sheets Connection Solutions

## ❌ **CURRENT STATUS: CONNECTION FAILING**

**Error:** `Method doesn't allow unregistered callers (callers without established identity)`

---

## 🎯 **SOLUTION OPTIONS**

### **Option 1: API Key Method (RECOMMENDED - EASIER)**

#### **Step 1: Get API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `chouieur-express-sheets`
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **API Key**
5. Copy the generated API key
6. (Optional) Click **Restrict Key** → **Google Sheets API**

#### **Step 2: Test Connection**
```bash
# Set your API key and test
GOOGLE_API_KEY=your_api_key_here node test-with-api-key.js
```

#### **Step 3: Update Environment**
Add to your `.env` file:
```bash
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
```

---

### **Option 2: Fix Service Account Method**

#### **Step 1: Enable Google Sheets API**
1. Go to [Google Sheets API Library](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
2. Make sure project `chouieur-express-sheets` is selected
3. Click **ENABLE** (if not already enabled)
4. Wait 2-3 minutes for full activation

#### **Step 2: Verify Service Account**
1. Go to **IAM & Admin** → **Service Accounts**
2. Find: `chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com`
3. Ensure status is **Active**

#### **Step 3: Share Google Sheet**
1. Open: https://docs.google.com/spreadsheets/d/13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
2. Click **Share** button
3. Add: `chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com`
4. Set permission to **Editor**
5. Click **Send**

#### **Step 4: Test Again**
```bash
node test-google-sheets-comprehensive.js
```

---

### **Option 3: Create New Test Sheet**

If the current sheet has issues:

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Add test data:
   ```
   Name | Price | Category | Description | Image
   Chicken Shawarma | 12.99 | Main | Tender chicken | /images/chicken.jpg
   Beef Kebab | 15.99 | Main | Grilled beef | /images/beef.jpg
   ```
4. Share with your service account
5. Update `GOOGLE_SHEETS_ID` in your code

---

## 🚀 **BACKEND INTEGRATION**

Once connection is working, use the provided backend:

```bash
# Install dependencies
npm install googleapis

# Run the integrated backend
node backend-with-sheets.js
```

**Available endpoints:**
- `GET /api/health` - Health check
- `GET /api/test-sheets` - Test Google Sheets connection
- `GET /api/menu-items` - Get menu items from sheets
- `POST /api/orders` - Create new order in sheets
- `GET /api/orders` - Get all orders from sheets

---

## 📋 **TESTING COMMANDS**

```bash
# Test with API key
GOOGLE_API_KEY=your_key node test-with-api-key.js

# Test with service account
node test-google-sheets-comprehensive.js

# Run integrated backend
node backend-with-sheets.js

# Test backend endpoints
curl http://localhost:10000/api/health
curl http://localhost:10000/api/test-sheets
```

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues:**

1. **"API not enabled"** → Enable Google Sheets API in Google Cloud Console
2. **"Permission denied"** → Share the sheet with your service account
3. **"Invalid credentials"** → Check if service account key is expired
4. **"Sheet not found"** → Verify the Google Sheets ID is correct

### **Quick Fixes:**

- **API Key method** is often easier than service accounts
- **Create a new sheet** if the current one has permission issues
- **Check billing** - some Google Cloud features require billing enabled
- **Wait 2-3 minutes** after enabling APIs for full activation

---

## 📞 **NEXT STEPS**

1. **Choose a solution** (API Key recommended)
2. **Test the connection** using provided scripts
3. **Integrate with backend** using `backend-with-sheets.js`
4. **Deploy to Render** with working Google Sheets integration

---

## 📁 **FILES CREATED**

- `test-with-api-key.js` - API key connection test
- `backend-with-sheets.js` - Complete backend with Google Sheets
- `diagnose-google-sheets.js` - Detailed diagnostic tool
- `test-google-sheets-comprehensive.js` - Service account test

**All tests are non-destructive** - they only read data and don't modify your sheets.
