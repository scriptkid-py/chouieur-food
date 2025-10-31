# 📊 Google Sheets Integration Setup Guide

This guide will help you connect your backend API to Google Sheets for menu management.

## 📋 Table of Contents
1. [Creating a Google Service Account](#1-creating-a-google-service-account)
2. [Setting Up Your Google Sheet](#2-setting-up-your-google-sheet)
3. [Configuring Environment Variables](#3-configuring-environment-variables)
4. [Testing the Integration](#4-testing-the-integration)
5. [API Endpoints Reference](#5-api-endpoints-reference)

---

## 1. Creating a Google Service Account

### Step 1: Create a New Project (or Use Existing)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Chouieur Express Menu`
4. Click **"Create"**

### Step 2: Enable Google Sheets API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and press **"Enable"**

### Step 3: Create Service Account

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - **Service account name**: `menu-api-service`
   - **Service account ID**: (auto-generated)
   - Click **"Create and Continue"**
4. Skip role assignment (click **"Continue"**)
5. Click **"Done"**

### Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **"JSON"** format
5. Click **"Create"** - A JSON file will download automatically
6. **SAVE THIS FILE SECURELY** - You'll need it in the next step

### Step 5: Get Service Account Email

1. Note the **Email** address of your service account (format: `something@project-name.iam.gserviceaccount.com`)
2. Copy this email - you'll need it later

---

## 2. Setting Up Your Google Sheet

### Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new sheet
3. Name it: **"Menu Items"** (or any name you prefer)

### Step 2: Set Up the Headers

1. In **row 1**, add these headers (one per column):

```
A1: id
B1: name
C1: category
D1: price
E1: megaPrice
F1: description
G1: imageId
H1: imageUrl
I1: isActive
J1: createdAt
K1: updatedAt
```

**Important:** The order must be exactly as shown above!

### Step 3: Share Sheet with Service Account

1. Click the **"Share"** button (top right)
2. Paste your **Service Account Email** (from Step 1.5)
3. Give it **"Editor"** permissions
4. **Uncheck** "Notify people" (we don't want to email the service account)
5. Click **"Share"**

### Step 4: Get Your Sheet ID

Look at your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
```

Copy the **`[SHEET_ID_HERE]`** part - this is your Sheet ID.

**Example:**
- URL: `https://docs.google.com/spreadsheets/d/1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD/edit`
- Sheet ID: `1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD`

### Step 5: Rename the Sheet Tab (Optional but Recommended)

1. At the bottom of your Google Sheet, right-click on **"Sheet1"**
2. Rename it to: **"MenuItems"** (exact name, case-sensitive)
3. Press Enter

**Note:** If you use a different name, update `SHEET_NAME` in `api/services/google-sheets-service.js`

---

## 3. Configuring Environment Variables

### For Local Development:

Create a `.env` file in the `api` folder:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID=your-sheet-id-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"

# Admin Authentication
ADMIN_PASSWORD=your-secure-password-here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Getting the Private Key:

1. Open the JSON file you downloaded in Step 1.4
2. Find the `"private_key"` field
3. Copy the entire value (including the `\n` characters)
4. Paste it in your `.env` file, wrapped in double quotes

**Example:**
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...your full key...\n-----END PRIVATE KEY-----\n"
```

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

```
GOOGLE_SHEETS_ID = your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL = your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n
ADMIN_PASSWORD = your-secure-password
```

**Important:** For `GOOGLE_PRIVATE_KEY`, paste the entire key with `\n` characters, no quotes needed in Vercel.

---

## 4. Testing the Integration

### Step 1: Test Local Connection

1. Start your server:
   ```bash
   cd api
   npm install
   node vercel-menu-sheets.js
   ```

2. Test health endpoint:
   ```bash
   curl http://localhost:3001/api/health
   ```

   Should return:
   ```json
   {
     "status": "OK",
     "googleSheets": {
       "configured": true,
       "sheetId": "Set"
     }
   }
   ```

### Step 2: Test GET Menu Items

```bash
curl http://localhost:3001/api/menu
```

Should return an empty array `[]` if the sheet is empty, or list of items if you have data.

### Step 3: Test Admin Login

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```

Should return:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "your-admin-password"
}
```

### Step 4: Test Adding a Menu Item

```bash
curl -X POST http://localhost:3001/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d '{
    "name": "Test Pizza",
    "category": "Pizza",
    "price": 12.99,
    "description": "A delicious test pizza",
    "imageUrl": "https://example.com/pizza.jpg"
  }'
```

Check your Google Sheet - you should see a new row with the item!

### Step 5: Test Updating Menu Item

First, get the item ID from the response above, then:

```bash
curl -X PUT http://localhost:3001/api/menu/item-1234567890-abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d '{
    "price": 14.99,
    "name": "Updated Pizza Name"
  }'
```

### Step 6: Test Deleting Menu Item

```bash
curl -X DELETE http://localhost:3001/api/menu/item-1234567890-abc123 \
  -H "Authorization: Bearer your-admin-password"
```

---

## 5. API Endpoints Reference

### Public Endpoints

#### `GET /api/menu`
Get all menu items from Google Sheets.

**Query Parameters:**
- `category` (optional) - Filter by category

**Example:**
```bash
GET /api/menu
GET /api/menu?category=Pizza
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-1234567890-abc",
      "name": "Margherita Pizza",
      "category": "Pizza",
      "price": 12.99,
      "megaPrice": 18.99,
      "description": "Classic margherita",
      "imageUrl": "https://example.com/pizza.jpg",
      "isActive": true,
      "createdAt": "2025-10-31T12:00:00.000Z",
      "updatedAt": "2025-10-31T12:00:00.000Z"
    }
  ],
  "count": 1,
  "source": "google-sheets"
}
```

#### `GET /api/menu/:id`
Get a single menu item by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item-1234567890-abc",
    "name": "Margherita Pizza",
    ...
  }
}
```

### Admin Endpoints (Require Authentication)

All admin endpoints require the `Authorization` header:
```
Authorization: Bearer your-admin-password
```

#### `POST /api/admin/login`
Login to get admin token.

**Request:**
```json
{
  "password": "your-admin-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "your-admin-password",
  "expiresIn": "24h"
}
```

#### `POST /api/menu`
Create a new menu item.

**Request:**
```json
{
  "name": "Margherita Pizza",
  "category": "Pizza",
  "price": 12.99,
  "megaPrice": 18.99,  // optional
  "description": "Classic margherita pizza",  // optional
  "imageUrl": "https://example.com/pizza.jpg",  // optional
  "isActive": true  // optional, default: true
}
```

**Required Fields:**
- `name` - Item name
- `price` - Item price (number)

**Optional Fields:**
- `category` - Item category (default: "Other")
- `megaPrice` - Mega/large size price
- `description` - Item description
- `imageUrl` - Image URL
- `isActive` - Whether item is active (default: true)

#### `PUT /api/menu/:id`
Update an existing menu item.

**Request:**
```json
{
  "name": "Updated Name",
  "price": 14.99
}
```

You can update any field. Only include fields you want to change.

#### `DELETE /api/menu/:id`
Delete a menu item from Google Sheets.

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully",
  "data": {
    "id": "item-1234567890-abc"
  }
}
```

---

## 🔒 Security Notes

1. **Admin Password:** Use a strong, unique password stored in environment variables
2. **Private Key:** Never commit the service account JSON file or private key to Git
3. **Sheet Access:** Only share the sheet with the service account email
4. **CORS:** In production, restrict CORS to your frontend domain only

---

## 🐛 Troubleshooting

### "Google Sheets not available" Error

**Possible Causes:**
1. Missing environment variables
2. Invalid service account credentials
3. Sheet not shared with service account
4. Wrong Sheet ID

**Solutions:**
1. Check all environment variables are set
2. Verify service account email matches the one in your JSON file
3. Ensure sheet is shared with service account (Editor permission)
4. Double-check Sheet ID in URL

### "Menu item not found" Error

- Check if the item ID exists in your Google Sheet
- Verify the ID column (column A) has the correct value
- Make sure you're using the exact ID from the sheet

### Items Not Appearing

- Check if `isActive` column is set to `TRUE` for items you want to show
- Verify the sheet tab name is "MenuItems" (case-sensitive)
- Check the headers are in the correct order (row 1)

### Can't Write to Sheet

- Ensure service account has **Editor** (not Viewer) permissions
- Check Google Sheets API is enabled in Google Cloud Console
- Verify the private key is correctly formatted with `\n` characters

---

## ✅ Checklist

Before deploying:

- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service account created
- [ ] Service account key downloaded (JSON)
- [ ] Google Sheet created with correct headers
- [ ] Sheet shared with service account email
- [ ] Sheet ID copied
- [ ] Environment variables set (local and Vercel)
- [ ] Admin password set
- [ ] Tested GET /api/menu locally
- [ ] Tested POST /api/menu locally
- [ ] Verified items appear in Google Sheet
- [ ] Deployed to Vercel
- [ ] Tested endpoints on Vercel

---

## 📚 Next Steps

After setup:
1. Add some test items via API
2. Verify they appear in Google Sheet
3. Update the frontend to use `/api/menu` endpoints
4. Test admin page for adding/editing/deleting items
5. Monitor Google Sheet for real-time updates

---

**Need Help?** Check the error logs in your server console or Vercel function logs.

