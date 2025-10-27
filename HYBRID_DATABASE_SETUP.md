# 📊 Google Sheets + MongoDB Hybrid Setup Guide

## ✅ What's Implemented

- **Menu Items**: Stored in Google Sheets (easy to edit)
- **Orders**: Stored in MongoDB (live database)
- **Automatic Fallback**: If Google Sheets fails, uses MongoDB

## 🎯 Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         │ GET /api/menu-items
         │
         ▼
┌─────────────────┐
│   Backend       │
│  (Express)      │
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌─────────┐  ┌────────┐
│ Google  │  │ MongoDB│
│ Sheets  │  │        │
│         │  │ Orders │
│ Menu    │  │ Users  │
└─────────┘  └────────┘
```

## 🚀 Setup Instructions

### Step 1: Create Google Sheet

1. Create a new Google Sheet
2. Name it "Chouieur Menu"
3. Create a sheet named "MenuItems"
4. Add headers in row 1:

| ID | Name | Category | Price | MegaPrice | Description | ImageId | ImageUrl | IsActive |
|----|------|----------|-------|-----------|-------------|---------|----------|----------|

### Step 2: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: `chouieur-sheets`
3. Enable "Google Sheets API"
4. Go to "Service Accounts" → "Create Service Account"
5. Download JSON key file
6. Share your Google Sheet with the service account email

### Step 3: Add Menu Items to Sheet

Example row:
```
pizza-margherita | Pizza Margherita | Pizza | 900 | 1000 | Classic cheese pizza | pizza-margherita | https://images.unsplash.com/... | TRUE
```

### Step 4: Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Step 5: MongoDB Setup (Already Done ✅)

Your MongoDB Atlas connection is already set up with:
- Orders collection
- Users collection
- Admin authentication

## 📋 API Endpoints

### Menu Items (from Google Sheets)
```
GET /api/menu-items
```

### Orders (MongoDB)
```
POST /api/orders          - Create order
GET /api/orders           - Get all orders
GET /api/orders/:id       - Get order by ID
PUT /api/orders/:id       - Update order
```

## 🔄 How It Works

1. User visits menu page
2. Backend tries to fetch from Google Sheets first
3. If Google Sheets fails or is empty, falls back to MongoDB
4. Orders always go to MongoDB (live database)

## 🛠️ Editing Menu Items

### Via Google Sheets (Recommended)
1. Open your Google Sheet
2. Edit menu items directly
3. Changes appear in the app immediately

### Via MongoDB (Fallback)
1. Connect to MongoDB Atlas
2. Edit MenuItems collection
3. Or use API endpoints

## 📊 Benefits

✅ **Easy Updates**: Edit menu in Google Sheets
✅ **Live Data**: Orders stored in MongoDB
✅ **Reliable**: Automatic fallback to MongoDB
✅ **No Backend Changes**: Just update the sheet

## 🎉 You're All Set!

Your app is now live at:
https://chouieur-express-3q9l1ca95-scriptkid-pys-projects.vercel.app

