# 🔍 Diagnosing the 500 Error

## The Problem
You're getting a **500 Internal Server Error** when trying to save a menu item with a photo. This means:
- ✅ Frontend is sending the data correctly (FormData with image)
- ✅ Request reaches the backend
- ❌ Something crashes when the backend tries to process it

## Quick Diagnostic Steps

### Step 1: Check the Error Response Body
In your browser's Network tab:
1. Find the POST request to `/api/menu-items`
2. Click on it
3. Go to the **Response** tab (not Headers)
4. Copy the JSON error message

It should look something like:
```json
{
  "success": false,
  "error": "Failed to create menu item",
  "message": "...",
  "errorName": "..."
}
```

### Step 2: Check Render Logs
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click **Logs** tab
4. Scroll to the most recent error
5. Look for lines starting with `❌`

### Step 3: Common Issues to Check

#### Issue 1: MongoDB Not Connected
**Symptoms:** Error about database connection
**Fix:** Check `MONGO_URI` environment variable in Render

#### Issue 2: Category Not in Enum
**Symptoms:** Validation error about category
**Fix:** Use one of these categories: `Sandwiches`, `Pizza`, `Tacos`, `Poulet`, `Hamburgers`, `Panini / Fajitas`, `Plats`

#### Issue 3: Google Sheets Error
**Symptoms:** Error saving to Google Sheets
**Fix:** Check Google Sheets credentials in Render environment variables

#### Issue 4: File Path Issue
**Symptoms:** Error reading file or file doesn't exist
**Fix:** This is handled by the code, but check Render logs

---

## What Information I Need

Please share:
1. **Error Response Body** (from Network tab → Response)
2. **Render Logs** (the last 50 lines after trying to upload)

With this, I can fix it immediately!

