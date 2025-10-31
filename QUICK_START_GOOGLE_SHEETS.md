# 🚀 Quick Start: Google Sheets Menu API

This guide will help you quickly set up and deploy the Google Sheets menu API.

## ⚡ Quick Setup (5 Minutes)

### Step 1: Create Google Service Account (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable "Google Sheets API"
3. Create Service Account → Create JSON key
4. **Download the JSON file** - you'll need it!

### Step 2: Create Google Sheet (1 minute)

1. Create new Google Sheet
2. Add headers in row 1:
   ```
   id | name | category | price | megaPrice | description | imageId | imageUrl | isActive | createdAt | updatedAt
   ```
3. Rename sheet tab to: **"MenuItems"**
4. **Share with service account email** (from JSON file) - Give **Editor** permission
5. Copy **Sheet ID** from URL

### Step 3: Set Environment Variables (1 minute)

In Vercel dashboard → Your Project → Settings → Environment Variables:

```
GOOGLE_SHEETS_ID = paste-your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL = paste-service-account-email
GOOGLE_PRIVATE_KEY = paste-private-key-from-json
ADMIN_PASSWORD = your-secure-password
```

**To get private key:**
- Open the downloaded JSON file
- Copy the `"private_key"` value
- Paste it exactly as-is (with `\n` characters)

### Step 4: Deploy to Vercel (1 minute)

1. Push code to GitHub
2. Vercel will auto-deploy
3. Test: `https://your-api.vercel.app/api/menu`

## ✅ Test Your API

### Test GET Menu (Public):
```bash
curl https://your-api.vercel.app/api/menu
```

### Test Admin Login:
```bash
curl -X POST https://your-api.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```

### Test Add Menu Item (Admin):
```bash
curl -X POST https://your-api.vercel.app/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d '{
    "name": "Test Item",
    "category": "Pizza",
    "price": 12.99,
    "description": "Test description",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

## 📝 API Endpoints

- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Add item (admin)
- `PUT /api/menu/:id` - Update item (admin)
- `DELETE /api/menu/:id` - Delete item (admin)
- `POST /api/admin/login` - Admin login

**Also available at `/api/menu-items` for frontend compatibility**

## 📖 Full Documentation

See `GOOGLE_SHEETS_SETUP_GUIDE.md` for detailed instructions.

---

**Troubleshooting:** Check Vercel function logs if endpoints don't work.

