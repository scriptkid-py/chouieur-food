# 📊 Google Sheets Database Setup Guide

This guide will help you set up Google Sheets as your database for the Chouieur Express application.

## 🎯 Overview

We're replacing MongoDB with Google Sheets to store:
- **Orders**: Customer orders and their details
- **MenuItems**: Restaurant menu items and pricing
- **Users**: User profiles and authentication data

## 📋 Prerequisites

- Google account
- Google Cloud Console access
- Basic understanding of Google Sheets

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Name: `chouieur-express-sheets`
   - Click "Create"

### Step 2: Enable Google Sheets API

1. **Navigate to APIs & Services**:
   - In the left sidebar, click "APIs & Services" → "Library"
2. **Search for Google Sheets API**:
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

### Step 3: Create Service Account

1. **Go to Credentials**:
   - Click "APIs & Services" → "Credentials"
2. **Create Service Account**:
   - Click "Create Credentials" → "Service Account"
   - Name: `chouieur-express-service`
   - Description: `Service account for Chouieur Express Google Sheets access`
   - Click "Create and Continue"
3. **Skip role assignment** (click "Continue")
4. **Click "Done"**

### Step 4: Generate Service Account Key

1. **Find your service account**:
   - In the Credentials page, find your service account
   - Click on the service account email
2. **Create key**:
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Click "Create"
3. **Download the JSON file** - keep it secure!

### Step 5: Create Google Sheet

1. **Create a new Google Sheet**: [sheets.google.com](https://sheets.google.com)
2. **Name it**: `Chouieur Express Database`
3. **Create the following tabs**:

#### 📋 Orders Tab
Create columns (A1:J1):
```
id | userId | customerName | customerPhone | customerAddress | items | total | status | createdAt | updatedAt
```

#### 🍕 MenuItems Tab
Create columns (A1:I1):
```
id | name | category | price | megaPrice | description | imageId | isActive | createdAt | updatedAt
```

#### 👥 Users Tab
Create columns (A1:G1):
```
id | firebaseUid | email | name | role | createdAt | updatedAt
```

### Step 6: Share Sheet with Service Account

1. **Get service account email**:
   - From the JSON file you downloaded, copy the `client_email` value
   - It looks like: `chouieur-express-service@your-project.iam.gserviceaccount.com`
2. **Share the sheet**:
   - In your Google Sheet, click "Share" (top right)
   - Add the service account email
   - Give it "Editor" permissions
   - Click "Send"

### Step 7: Get Sheet ID

1. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
2. **Save this ID** - you'll need it for environment variables

### Step 8: Configure Environment Variables

1. **Open the downloaded JSON file** and extract:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`
   - Sheet ID → `GOOGLE_SHEETS_ID`

2. **Update your `.env` file**:
   ```env
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```

## 🔧 Sample Data

### Menu Items Sample Data
Add these rows to your MenuItems tab:

| id | name | category | price | megaPrice | description | imageId | isActive | createdAt | updatedAt |
|----|------|----------|-------|-----------|-------------|---------|----------|-----------|-----------|
| item_1 | Sandwich Pilon | Sandwiches | 350 | | A signature sandwich with savory fillings. | sandwich-pilon | true | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z |
| item_2 | Pizza Fromage | Pizza | 900 | 1000 | A classic cheese pizza with a rich tomato base. | pizza-fromage | true | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z |
| item_3 | Tacos Viande | Tacos | 350 | | Flavorful meat tacos with fresh toppings. | tacos-viande | true | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z |

## 🧪 Testing Your Setup

1. **Start your backend server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Check the logs** for:
   ```
   ✅ Google Sheets Connected
   📊 Google Sheets: Sheet name: Chouieur Express Database
   ```

3. **Test API endpoints**:
   ```bash
   # Test health endpoint
   curl http://localhost:5000/api/health
   
   # Test menu items
   curl http://localhost:5000/api/menu-items
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **"Permission denied" error**:
   - Ensure the service account email has Editor access to the sheet
   - Check that the sheet ID is correct

2. **"API not enabled" error**:
   - Verify Google Sheets API is enabled in your Google Cloud project

3. **"Invalid credentials" error**:
   - Check that the private key is properly formatted with `\n` for newlines
   - Ensure the service account email is correct

4. **"Sheet not found" error**:
   - Verify the sheet ID is correct
   - Check that the sheet exists and is accessible

### Debug Steps:

1. **Check environment variables**:
   ```bash
   echo $GOOGLE_SHEETS_ID
   echo $GOOGLE_SERVICE_ACCOUNT_EMAIL
   ```

2. **Test sheet access manually**:
   - Try accessing the sheet with the service account email
   - Verify the sheet structure matches the expected format

3. **Check Google Cloud Console**:
   - Verify the service account exists
   - Check that the API is enabled
   - Review any error logs

## 🔒 Security Notes

- **Never commit** the service account JSON file to version control
- **Keep the private key secure** - treat it like a password
- **Use environment variables** for all sensitive data
- **Regularly rotate** service account keys in production

## 📊 Data Structure

### Orders Table Structure:
- `id`: Unique order identifier
- `userId`: Firebase user ID
- `customerName`: Customer's full name
- `customerPhone`: Customer's phone number
- `customerAddress`: Delivery address
- `items`: JSON string of order items
- `total`: Order total amount
- `status`: Order status (pending, confirmed, ready, delivered)
- `createdAt`: Order creation timestamp
- `updatedAt`: Last update timestamp

### MenuItems Table Structure:
- `id`: Unique menu item identifier
- `name`: Item name
- `category`: Item category (Sandwiches, Pizza, etc.)
- `price`: Base price
- `megaPrice`: Mega size price (optional)
- `description`: Item description
- `imageId`: Image identifier
- `isActive`: Whether item is available
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Users Table Structure:
- `id`: Unique user identifier
- `firebaseUid`: Firebase user ID
- `email`: User's email address
- `name`: User's display name
- `role`: User role (admin, kitchen, customer)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

## 🎉 Success!

Once you see the "✅ Google Sheets Connected" message, your database is ready! Your Chouieur Express application will now use Google Sheets instead of MongoDB for data storage.

---

**Need help?** Check the troubleshooting section above or review the Google Sheets API documentation.
