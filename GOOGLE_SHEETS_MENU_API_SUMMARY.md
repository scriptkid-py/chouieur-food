# 📊 Google Sheets Menu API - Complete Summary

## ✅ What's Been Created

Your backend is now ready to use Google Sheets as the database for menu items! Here's what was built:

### **Files Created:**

1. **`api/menu-sheets-api.js`** - API routes for menu CRUD operations
   - GET, POST, PUT, DELETE endpoints
   - Admin authentication middleware
   - Both `/api/menu` and `/api/menu-items` endpoints (frontend compatible)

2. **`api/vercel-menu-sheets.js`** - Vercel serverless function
   - Standalone Express app ready for Vercel
   - CORS configured
   - Health check endpoint

3. **`GOOGLE_SHEETS_SETUP_GUIDE.md`** - Complete setup instructions
4. **`QUICK_START_GOOGLE_SHEETS.md`** - Quick 5-minute setup guide

### **Files Updated:**

1. **`api/vercel.json`** - Routes menu endpoints to Google Sheets API
2. **`api/env.example`** - Added Google Sheets environment variables

---

## 🚀 API Endpoints

### **Public Endpoints (No Auth Required):**

```
GET /api/menu
GET /api/menu-items          (alternative endpoint)
GET /api/menu/:id
GET /api/menu-items/:id      (alternative endpoint)
```

### **Admin Endpoints (Auth Required):**

```
POST   /api/menu
POST   /api/menu-items       (alternative endpoint)
PUT    /api/menu/:id
PUT    /api/menu-items/:id  (alternative endpoint)
DELETE /api/menu/:id
DELETE /api/menu-items/:id  (alternative endpoint)
POST   /api/admin/login
```

### **How Authentication Works:**

1. Admin logs in: `POST /api/admin/login` with password
2. Server returns token (admin password)
3. Use token in header: `Authorization: Bearer your-admin-password`
4. All POST/PUT/DELETE operations require this header

---

## 🔧 Setup Steps

### **1. Google Sheets Setup (5 minutes)**

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable "Google Sheets API"
   - Create Service Account → Download JSON key

2. **Create Google Sheet:**
   - Create new sheet
   - Add headers (row 1): `id | name | category | price | megaPrice | description | imageId | imageUrl | isActive | createdAt | updatedAt`
   - Rename tab to: **"MenuItems"**
   - Share with service account email (Editor permission)
   - Copy Sheet ID from URL

### **2. Environment Variables**

Set these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```
GOOGLE_SHEETS_ID = your-sheet-id-from-url
GOOGLE_SERVICE_ACCOUNT_EMAIL = service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...full key...\n-----END PRIVATE KEY-----\n
ADMIN_PASSWORD = your-secure-password
```

**Getting the Private Key:**
- Open downloaded JSON file
- Copy the `"private_key"` value exactly as-is
- Paste into Vercel (no quotes needed in Vercel dashboard)

### **3. Deploy to Vercel**

1. Push code to GitHub
2. Vercel auto-deploys
3. Your API is live!

---

## 📝 Google Sheet Structure

Your Google Sheet should look like this:

| id | name | category | price | megaPrice | description | imageId | imageUrl | isActive | createdAt | updatedAt |
|----|------|----------|-------|-----------|-------------|---------|----------|----------|-----------|-----------|
| item-123 | Pizza Margherita | Pizza | 12.99 | 18.99 | Classic pizza | | https://... | TRUE | 2025-10-31T... | 2025-10-31T... |
| item-456 | Burger | Hamburgers | 8.99 | | Delicious burger | | https://... | TRUE | 2025-10-31T... | 2025-10-31T... |

**Important:**
- Row 1 must be headers (exact names as shown)
- Sheet tab must be named: **"MenuItems"** (case-sensitive)
- `isActive` must be `TRUE` for items to show on menu page
- IDs are auto-generated when creating items

---

## 🧪 Testing Your API

### **1. Test Health Check:**
```bash
curl https://your-api.vercel.app/api/health
```

Should return:
```json
{
  "status": "OK",
  "googleSheets": {
    "configured": true
  }
}
```

### **2. Test Get Menu (Public):**
```bash
curl https://your-api.vercel.app/api/menu
```

Returns all active menu items from Google Sheets.

### **3. Test Admin Login:**
```bash
curl -X POST https://your-api.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```

Returns token for admin operations.

### **4. Test Add Menu Item:**
```bash
curl -X POST https://your-api.vercel.app/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d '{
    "name": "Test Pizza",
    "category": "Pizza",
    "price": 12.99,
    "description": "A test pizza",
    "imageUrl": "https://example.com/pizza.jpg"
  }'
```

**Check your Google Sheet** - you should see a new row appear!

### **5. Test Update Menu Item:**
```bash
curl -X PUT https://your-api.vercel.app/api/menu/item-1234567890-abc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d '{
    "price": 14.99,
    "name": "Updated Pizza Name"
  }'
```

### **6. Test Delete Menu Item:**
```bash
curl -X DELETE https://your-api.vercel.app/api/menu/item-1234567890-abc \
  -H "Authorization: Bearer your-admin-password"
```

---

## 🔄 How It Works

### **Real-Time Updates:**

1. **Admin adds item** → API writes to Google Sheet → Sheet updates instantly
2. **Menu page loads** → API reads from Google Sheet → Displays latest data
3. **No database needed** → Everything stored in Google Sheets!

### **Data Flow:**

```
Frontend (Menu Page)
    ↓ GET /api/menu
Backend API
    ↓ Google Sheets API
Google Sheet (MenuItems)
    ↓ Returns data
Backend API
    ↓ JSON response
Frontend (Displays items)
```

### **Admin Operations:**

```
Admin Page
    ↓ POST /api/admin/login (password)
Backend → Returns token
    ↓ POST /api/menu + Authorization header
Backend → Writes to Google Sheet
Google Sheet → Updates instantly
Menu Page → Automatically shows new item (on next load)
```

---

## 📱 Frontend Integration

### **Your Frontend Already Works!**

The API supports both endpoints:
- `/api/menu` (new endpoints)
- `/api/menu-items` (existing frontend endpoints)

**Your frontend code doesn't need to change!** It will automatically use Google Sheets as the data source.

### **Admin Page Integration:**

If you want to update the admin page to use the new endpoints:

1. **Login:**
   ```javascript
   const response = await fetch('/api/admin/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ password: 'your-admin-password' })
   });
   const { token } = await response.json();
   localStorage.setItem('adminToken', token);
   ```

2. **Add Item:**
   ```javascript
   await fetch('/api/menu', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
     },
     body: JSON.stringify({
       name: 'New Item',
       category: 'Pizza',
       price: 12.99,
       description: 'Description',
       imageUrl: 'https://...'
     })
   });
   ```

3. **Update Item:**
   ```javascript
   await fetch(`/api/menu/${itemId}`, {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
     },
     body: JSON.stringify({ price: 14.99 })
   });
   ```

4. **Delete Item:**
   ```javascript
   await fetch(`/api/menu/${itemId}`, {
     method: 'DELETE',
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
     }
   });
   ```

---

## 🔒 Security

### **Current Setup:**
- Admin password stored in environment variable
- Simple token authentication (password as token)
- CORS enabled for frontend domains

### **For Production:**
Consider upgrading to:
- JWT tokens (expiring tokens)
- More secure password hashing
- Rate limiting
- CORS restrictions to specific domains only

---

## 🐛 Common Issues

### **"Google Sheets not available" Error**

**Cause:** Missing or incorrect environment variables

**Fix:**
1. Check all 3 Google Sheets variables are set in Vercel
2. Verify private key includes `\n` characters
3. Ensure sheet is shared with service account

### **"Menu item not found" Error**

**Cause:** Item ID doesn't exist in sheet

**Fix:**
1. Check the ID exists in column A of your sheet
2. Verify you're using the exact ID from the sheet

### **Items Not Appearing**

**Cause:** `isActive` column not set to `TRUE`

**Fix:**
1. Check column I (isActive) in your Google Sheet
2. Set value to `TRUE` for items you want to show

### **Can't Write to Sheet**

**Cause:** Service account doesn't have permission

**Fix:**
1. Share sheet with service account email
2. Give **Editor** (not Viewer) permission
3. Ensure Google Sheets API is enabled

---

## 📚 Documentation Files

- **`GOOGLE_SHEETS_SETUP_GUIDE.md`** - Complete detailed setup guide
- **`QUICK_START_GOOGLE_SHEETS.md`** - 5-minute quick start
- **This file** - Overview and summary

---

## ✅ Deployment Checklist

Before going live:

- [ ] Google Service Account created
- [ ] Google Sheets API enabled
- [ ] Google Sheet created with correct headers
- [ ] Sheet shared with service account
- [ ] Environment variables set in Vercel
- [ ] Admin password set
- [ ] Tested GET /api/menu locally
- [ ] Tested POST /api/menu with admin auth
- [ ] Verified items appear in Google Sheet
- [ ] Deployed to Vercel
- [ ] Tested all endpoints on Vercel
- [ ] Frontend connects successfully

---

## 🎉 You're All Set!

Your menu API is now connected to Google Sheets! Every change made through the admin page will instantly update your Google Sheet, and the menu page will always show the latest data.

**Next Steps:**
1. Follow the setup guide to configure Google Sheets
2. Deploy to Vercel
3. Test the endpoints
4. Start adding menu items!

**Questions?** Check the detailed guides or review the code comments.

