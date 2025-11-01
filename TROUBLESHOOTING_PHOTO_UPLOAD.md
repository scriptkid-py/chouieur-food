# 🔍 Troubleshooting Photo Upload Issue

## Common Error: "MenuItem validation failed: description: Description is required, price: Price is required, name: Menu item name is required"

This error means the backend is receiving the image file but **NOT** the text fields (name, description, price).

---

## ✅ Fixes Applied

1. **FormData Headers**: Fixed `apiRequest` to NOT set Content-Type for FormData (browser sets it automatically with boundary)
2. **Multer Error Handling**: Improved error handling in middleware chain
3. **Enhanced Logging**: Backend logs all FormData parsing steps

---

## 🧪 Testing Steps

1. **Open browser console** (F12) and go to Network tab
2. **Try uploading a menu item with photo**
3. **Check browser console** for:
   - `📤 FormData detected`
   - `📦 FormData entries:` (should show all fields)
   - `✅ All required fields present in FormData`

4. **Check Network tab**:
   - Find the POST request to `/api/menu-items`
   - Look at **Request Headers**:
     - Should have: `Content-Type: multipart/form-data; boundary=...`
     - Should NOT have manually set Content-Type
   - Look at **Request Payload**:
     - Should show `image: [File]`, `name: "..."`, `description: "..."`, `price: "..."`

5. **Check Render logs** (Backend):
   Look for these log lines:
   ```
   📥 Incoming menu-item request:
     Content-Type: multipart/form-data; boundary=...
   🔍 Multer middleware - After parsing:
     📦 req.body: { name: '...', description: '...', price: '...' }
     📁 req.file: { fieldname: 'image', ... }
   ```

---

## ❌ If Still Getting Error

### Check 1: Are text fields empty in logs?
If `req.body` is empty in backend logs but file exists, multer isn't parsing FormData correctly.

**Solution**: Check if Content-Type header includes `boundary` parameter. If not, the browser isn't setting it correctly.

### Check 2: Is Content-Type wrong?
Backend logs show: `⚠️ WARNING: Content-Type is not multipart/form-data!`

**Solution**: Frontend might be setting Content-Type manually. Check `api-config.ts` - it should NOT set headers for FormData.

### Check 3: Are fields being appended correctly?
Browser console shows FormData but some fields are missing.

**Solution**: Check `MenuItemForm.tsx` - all fields should use `formData.append()` before sending.

### Check 4: Is the file too large?
Backend returns: `File too large`

**Solution**: Image must be < 5MB. Compress image or reduce size.

### Check 5: Is file type invalid?
Backend returns: `Invalid file type`

**Solution**: Only JPEG, JPG, PNG, WEBP are allowed.

---

## 📋 Debug Checklist

- [ ] Browser console shows FormData with all fields
- [ ] Network tab shows `Content-Type: multipart/form-data; boundary=...`
- [ ] Render logs show `req.body` with name, description, price
- [ ] Render logs show `req.file` with image info
- [ ] Image file is < 5MB
- [ ] Image type is JPEG/PNG/WEBP

---

## 🔧 Manual Test with Postman

1. Open Postman
2. POST to: `https://chouieur-express-backend-h74v.onrender.com/api/menu-items`
3. Body → form-data
4. Add fields:
   - `name` (text): "Test Item"
   - `description` (text): "Test Description"
   - `price` (text): "10.50"
   - `category` (text): "Sandwiches"
   - `image` (file): Select an image
5. Send request

If this works, the issue is in the frontend FormData construction.

---

## 💡 Common Causes

1. **Browser setting wrong Content-Type**: Fixed by removing header in `api-config.ts`
2. **Multer not parsing**: Should work now with fixed middleware order
3. **Fields not in FormData**: Check `MenuItemForm.tsx` - all fields should be appended
4. **Render ephemeral storage**: Images saved to `/uploads` will be lost - use Cloudinary

---

## 🚀 Next Steps

After fixes are deployed:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Try uploading again
4. Check browser console AND Render logs
5. Share both sets of logs if issue persists

