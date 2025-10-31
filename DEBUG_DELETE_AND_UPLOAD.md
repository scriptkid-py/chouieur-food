# 🐛 Debug Guide: Delete and Image Upload Issues

## 🔍 Step-by-Step Debugging

### **Step 1: Check Browser Console**

1. **Open your website** (local or Render)
2. **Open Browser Console** (F12 → Console tab)
3. **Try to delete a menu item**
4. **Look for these logs:**
   - `🗑️ Attempting to delete menu item:` - Shows the item ID
   - `📡 Delete response:` - Shows what the backend returned
   - Any error messages

5. **Try to upload an image**
6. **Look for these logs:**
   - `📤 Uploading menu item with image:` - Shows form data
   - `📥 Menu item save response:` - Shows backend response
   - Any error messages

### **Step 2: Check Backend Logs (Render Dashboard)**

1. Go to **Render Dashboard** → Your backend service
2. Click **"Logs"** tab
3. **Try to delete/upload** from frontend
4. **Watch for these logs in real-time:**

#### Delete logs to look for:
- `🗑️ Delete request for menu item ID: [id]`
- `📊 Using Google Sheets for deletion`
- `✅ Successfully deleted menu item "[id]" from Google Sheets`
- `❌ Menu item with ID "[id]" not found in Google Sheets`

#### Upload logs to look for:
- `📝 Creating new menu item...`
- `📦 Request body:` - Should show form fields
- `📁 Uploaded file:` - Should show file info
- `🖼️ Image file uploaded with menu item:`

### **Step 3: Verify Item IDs**

**Problem**: The frontend might be using a different ID format than Google Sheets expects.

**Check:**
1. In browser console, when you see `🗑️ Attempting to delete menu item:`, note the ID
2. Go to your Google Sheet
3. Check column A (the ID column)
4. **Verify the ID format matches**

**Common issues:**
- Frontend uses `item.id` which might be different from Google Sheets ID
- Google Sheets might use row numbers vs UUIDs

### **Step 4: Test Backend Directly**

**Test Delete:**
```bash
# Replace [ID] with actual menu item ID from Google Sheet
curl -X DELETE https://chouieur-express-backend.onrender.com/api/menu-items/[ID]
```

**Test Create with Image:**
```bash
curl -X POST https://chouieur-express-backend.onrender.com/api/menu-items \
  -F "name=Test Item" \
  -F "category=Pizza" \
  -F "price=1000" \
  -F "description=Test description" \
  -F "image=@/path/to/image.jpg"
```

### **Step 5: Check Common Issues**

#### ❌ **Issue 1: Authentication Required**
**Symptoms:**
- Error: `401 Unauthorized` or `Admin authentication required`
- Backend logs: `Admin password not set - allowing all requests`

**Solution:**
- Check if `ADMIN_PASSWORD` is set in Render
- If set, you need to login via `/api/admin/login` first
- If not set, should work automatically

#### ❌ **Issue 2: ID Mismatch**
**Symptoms:**
- Error: `Menu item with ID [id] does not exist`
- Delete seems to work but item still in list

**Solution:**
- Check if frontend `item.id` matches Google Sheets column A
- Google Sheets uses the ID from column A, not MongoDB `_id`
- Frontend might be using wrong ID field

#### ❌ **Issue 3: Image Upload Fails Silently**
**Symptoms:**
- No error message
- Menu item created but no image
- Backend logs show no file

**Solution:**
- Check browser console for FormData logs
- Verify image file is selected before submit
- Check file size (must be < 5MB)
- Check file type (must be jpg, png, or webp)

#### ❌ **Issue 4: Google Sheets Not Connected**
**Symptoms:**
- Backend logs: `Google Sheets client not initialized`
- All operations fail

**Solution:**
- Verify environment variables in Render:
  - `GOOGLE_SHEETS_ID`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
- Check backend logs for initialization errors

## 🧪 Quick Test Commands

### **Test 1: Check if Backend is Working**
```bash
curl https://chouieur-express-backend.onrender.com/api/health
```

Should return: `{"status":"OK",...}`

### **Test 2: List Menu Items**
```bash
curl https://chouieur-express-backend.onrender.com/api/menu-items
```

Check the IDs returned - note the format

### **Test 3: Check Google Sheets Connection**
Look in backend logs for:
- `✅ Google Sheets client initialized` - Good
- `⚠️ Google Sheets credentials not configured` - Bad

## 📋 What to Share for Help

If still not working, please share:

1. **Browser Console Output** (from F12 → Console)
   - Copy all logs when you try delete/upload

2. **Backend Logs** (from Render dashboard)
   - Copy logs from when you try delete/upload

3. **Network Tab** (from F12 → Network)
   - Find the DELETE or POST request
   - Check Request Headers
   - Check Response (status code and body)

4. **Item ID Format**
   - What ID shows in browser console
   - What ID is in Google Sheet column A

5. **Error Messages**
   - Exact error message from toast/console

## 🔧 Quick Fixes to Try

1. **Clear browser cache** and try again
2. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Render backend is running** (not sleeping)
4. **Verify environment variables** in Render dashboard
5. **Check Google Sheet permissions** (service account must have edit access)

---

**Once you have the logs, we can identify the exact issue!**

