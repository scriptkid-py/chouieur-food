# 🖼️ Image Upload Guide for Menu Items

## ✅ Features Added

Your menu API now supports image uploads for menu items! You can add photos to menu items in three ways:

1. **Upload image separately** - Upload image first, get URL, then create menu item
2. **Create with image** - Upload image and create menu item in one request
3. **Update with image** - Update existing menu item with new image

## 📋 API Endpoints

### 1. Upload Image Only

**Endpoint:** `POST /api/menu-items/upload-image`

**Request:**
- Content-Type: `multipart/form-data`
- Form field: `image` (file)

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully to Cloudinary",
  "imageUrl": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "chouieur-express/menu-items/xyz",
  "fileName": "image-1234567890.jpg",
  "width": 800,
  "height": 600
}
```

**Example (curl):**
```bash
curl -X POST https://your-backend.onrender.com/api/menu-items/upload-image \
  -F "image=@/path/to/image.jpg"
```

### 2. Create Menu Item with Image

**Endpoint:** `POST /api/menu` or `POST /api/menu-items`

**Request Options:**

**Option A: JSON with imageUrl (if you uploaded separately)**
- Content-Type: `application/json`
- Body:
```json
{
  "name": "Delicious Burger",
  "category": "Food",
  "price": 12.99,
  "description": "A tasty burger",
  "imageUrl": "https://res.cloudinary.com/.../image.jpg",
  "isActive": true
}
```

**Option B: Multipart form data (upload image directly)**
- Content-Type: `multipart/form-data`
- Form fields:
  - `image`: (file)
  - `name`: "Delicious Burger"
  - `category`: "Food"
  - `price`: "12.99"
  - `description`: "A tasty burger"
  - `isActive`: "true"

**Example (curl with file):**
```bash
curl -X POST https://your-backend.onrender.com/api/menu \
  -H "Authorization: Bearer your-admin-token" \
  -F "image=@/path/to/image.jpg" \
  -F "name=Delicious Burger" \
  -F "category=Food" \
  -F "price=12.99" \
  -F "description=A tasty burger" \
  -F "isActive=true"
```

### 3. Update Menu Item with Image

**Endpoint:** `PUT /api/menu/:id` or `PUT /api/menu-items/:id`

**Request Options:**

**Option A: JSON (update without changing image)**
- Content-Type: `application/json`
- Body:
```json
{
  "name": "Updated Burger Name",
  "price": 14.99,
  "imageUrl": "https://existing-image-url.jpg"
}
```

**Option B: Multipart form data (update with new image)**
- Content-Type: `multipart/form-data`
- Form fields:
  - `image`: (file) - new image file
  - `name`: "Updated Burger Name"
  - `price`: "14.99"
  - Other fields...

**Example (curl with new image):**
```bash
curl -X PUT https://your-backend.onrender.com/api/menu/ITEM_ID \
  -H "Authorization: Bearer your-admin-token" \
  -F "image=@/path/to/new-image.jpg" \
  -F "name=Updated Burger" \
  -F "price=14.99"
```

## 🖼️ Image Storage Options

### Option 1: Cloudinary (Recommended)

**Setup:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials:
   - Cloud name
   - API Key
   - API Secret
3. Set environment variables in Render:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

**Benefits:**
- Images stored in cloud
- Automatic optimization
- CDN delivery
- Free tier available

### Option 2: Data URL (Fallback)

If Cloudinary is not configured, images will be converted to base64 data URLs and stored directly in Google Sheets.

**Benefits:**
- No external service needed
- Works immediately

**Limitations:**
- Larger data size in Google Sheets
- Slower loading for large images
- Not recommended for production

## 📝 Frontend Integration

### Using Fetch API

**Upload image separately:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const uploadResponse = await fetch('/api/menu-items/upload-image', {
  method: 'POST',
  body: formData
});

const { imageUrl } = await uploadResponse.json();

// Then create menu item with imageUrl
const menuItem = {
  name: "Burger",
  category: "Food",
  price: 12.99,
  imageUrl: imageUrl
};

await fetch('/api/menu', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(menuItem)
});
```

**Create menu item with image directly:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('name', 'Burger');
formData.append('category', 'Food');
formData.append('price', '12.99');
formData.append('description', 'A delicious burger');
formData.append('isActive', 'true');

await fetch('/api/menu', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
    // Don't set Content-Type - browser will set it with boundary
  },
  body: formData
});
```

## 🎨 Image Requirements

- **Formats:** JPEG, JPG, PNG, WebP
- **Max Size:** 5MB
- **Recommended Size:** 800x600px (auto-optimized if using Cloudinary)
- **Aspect Ratio:** Any (will be auto-cropped to limit if using Cloudinary)

## 🔍 Google Sheets Storage

Images are stored in the `imageUrl` column in your Google Sheets MenuItems tab:

| id | name | category | price | ... | imageUrl |
|----|------|----------|-------|-----|----------|
| abc | Burger | Food | 12.99 | ... | https://res.cloudinary.com/.../image.jpg |

The `imageUrl` can be:
- Cloudinary URL: `https://res.cloudinary.com/...`
- Data URL: `data:image/jpeg;base64,/9j/4AAQ...`
- Any other image URL

## ✅ Testing

### Test Image Upload

```bash
# Upload image
curl -X POST https://your-backend.onrender.com/api/menu-items/upload-image \
  -F "image=@test-image.jpg"

# Create menu item with image
curl -X POST https://your-backend.onrender.com/api/menu \
  -F "image=@test-image.jpg" \
  -F "name=Test Item" \
  -F "category=Test" \
  -F "price=9.99" \
  -F "description=Test description"
```

## 🚀 Deployment Notes

1. **Cloudinary Setup (Optional but Recommended):**
   - Add Cloudinary credentials to Render environment variables
   - Images will be optimized and served via CDN

2. **Without Cloudinary:**
   - Images will use data URLs
   - Works but less efficient for large images
   - Fine for small menus or testing

3. **Render File System:**
   - Uploaded files are temporarily stored during processing
   - Files are deleted after upload to Cloudinary or conversion to data URL
   - No permanent file storage on Render (ephemeral filesystem)

## 📋 Summary

✅ **Image upload endpoint:** `POST /api/menu-items/upload-image`  
✅ **Create with image:** `POST /api/menu` (multipart/form-data)  
✅ **Update with image:** `PUT /api/menu/:id` (multipart/form-data)  
✅ **Cloudinary support:** Automatic if configured  
✅ **Data URL fallback:** Works without Cloudinary  
✅ **Google Sheets storage:** Images saved in `imageUrl` column  

Your menu items can now have beautiful photos! 📸
