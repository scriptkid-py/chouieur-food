# 🖼️ Image Upload System - Chouieur Express

## 📋 Overview

This guide explains how to use the new image upload system for menu items in your restaurant application. The system allows you to upload actual photos of your menu items instead of using placeholder images.

## 🚀 Features

- **Image Upload**: Upload JPEG, PNG, and WebP images up to 5MB
- **Image Preview**: See image previews before saving
- **Fallback System**: Falls back to placeholder images if no custom image is uploaded
- **Admin Interface**: Easy-to-use admin panel for managing menu items
- **Local Storage**: Images stored locally in `/uploads/menu-images/` directory

## 🛠️ Setup Instructions

### 1. Install Dependencies

The required dependencies have been added to `package.json`:

```bash
npm install multer uuid
```

### 2. Update Google Sheets Schema

Run the schema update script to add the ImageUrl column:

```bash
node scripts/update-menu-schema.js
```

This will:
- Add an `ImageUrl` column to your MenuItems sheet
- Preserve all existing data
- Add empty ImageUrl values for existing menu items

### 3. Start the Backend Server

```bash
npm run backend
```

The server will automatically:
- Create the `/uploads/menu-images/` directory
- Serve uploaded images at `/uploads/menu-images/`
- Handle image uploads via the API

## 📱 How to Use

### Admin Panel

1. **Access Admin Panel**: Go to `/admin/menu`
2. **Add New Menu Item**: Click "Add Menu Item" button
3. **Upload Image**: 
   - Click the upload area or "Change Image" button
   - Select an image file (JPEG, PNG, WebP)
   - See the preview
   - Fill in other menu item details
   - Click "Create Menu Item"

### API Endpoints

#### Upload Image Only
```bash
POST /api/menu-items/upload-image
Content-Type: multipart/form-data

# Form data:
# image: [file]
```

#### Create Menu Item with Image
```bash
POST /api/menu-items
Content-Type: multipart/form-data

# Form data:
# image: [file] (optional)
# name: "Sandwich Pilon"
# category: "Sandwiches"
# price: 350
# megaPrice: 500 (optional)
# description: "A delicious sandwich"
# imageId: "sandwich-pilon" (fallback)
```

#### Update Menu Item with Image
```bash
PUT /api/menu-items/:id
Content-Type: multipart/form-data

# Form data:
# image: [file] (optional)
# name: "Updated Name"
# category: "Pizza"
# price: 400
# description: "Updated description"
```

## 🗂️ File Structure

```
project/
├── uploads/
│   └── menu-images/
│       ├── uuid-timestamp.jpg
│       ├── uuid-timestamp.png
│       └── ...
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── MenuItemForm.tsx
│   │   │   └── AdminSidebar.tsx
│   │   └── menu/
│   │       └── MenuItemCard.tsx
│   ├── app/
│   │   └── admin/
│   │       └── menu/
│   │           └── page.tsx
│   └── lib/
│       └── types.ts
└── scripts/
    └── update-menu-schema.js
```

## 🔧 Configuration

### Image Settings

- **Max File Size**: 5MB
- **Allowed Types**: JPEG, PNG, WebP
- **Storage Location**: `/uploads/menu-images/`
- **URL Pattern**: `/uploads/menu-images/{filename}`

### Google Sheets Schema

The MenuItems sheet now has this structure:

| Column | Description |
|--------|-------------|
| A | ID (UUID) |
| B | Name |
| C | Category |
| D | Price |
| E | MegaPrice |
| F | Description |
| G | ImageId (fallback) |
| H | ImageUrl (actual uploaded image) |
| I | IsActive |

## 🎨 Frontend Integration

### MenuItemCard Component

The `MenuItemCard` component automatically:
- Uses `imageUrl` if available
- Falls back to placeholder images using `imageId`
- Shows "No Image" if neither is available

### TypeScript Types

```typescript
export type MenuItem = {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  megaPrice?: number;
  description: string;
  imageId: string;        // Fallback image ID
  imageUrl?: string;      // Actual uploaded image URL
  isActive?: boolean;
};
```

## 🚨 Troubleshooting

### Common Issues

1. **"No image file provided"**
   - Make sure you're sending the file in the `image` field
   - Check that the file is actually selected

2. **"Invalid file type"**
   - Only JPEG, PNG, and WebP files are allowed
   - Check the file extension and MIME type

3. **"File too large"**
   - Maximum file size is 5MB
   - Compress the image or use a smaller file

4. **Images not displaying**
   - Check that the backend is serving static files from `/uploads`
   - Verify the image URL is correct
   - Check browser console for 404 errors

### Debug Steps

1. **Check Backend Logs**:
   ```bash
   # Look for upload-related logs
   tail -f logs/app.log
   ```

2. **Verify File Upload**:
   ```bash
   # Check if files are being saved
   ls -la uploads/menu-images/
   ```

3. **Test API Endpoints**:
   ```bash
   # Test image upload
   curl -X POST -F "image=@test.jpg" http://localhost:3001/api/menu-items/upload-image
   ```

## 🔄 Migration from Placeholder Images

### Existing Menu Items

1. **Run Schema Update**: `node scripts/update-menu-schema.js`
2. **Upload Images**: Use the admin panel to add images to existing items
3. **Verify Display**: Check that images show correctly on the menu page

### Gradual Migration

- Existing items will continue to show placeholder images
- New items can have custom images uploaded
- You can update existing items one by one through the admin panel

## 🚀 Production Deployment

### Render.com Deployment

1. **Environment Variables**: No additional variables needed
2. **File Storage**: Images are stored in the container's file system
3. **Static Serving**: Backend serves images via Express static middleware

### Important Notes

- **File Persistence**: Files are stored in the container and may be lost on redeployment
- **For Production**: Consider using cloud storage (AWS S3, Google Cloud Storage, etc.)
- **Backup**: Regularly backup the `/uploads` directory

## 🔮 Future Enhancements

### Planned Features

1. **Cloud Storage Integration**:
   - Firebase Storage
   - AWS S3
   - Google Cloud Storage

2. **Image Processing**:
   - Automatic resizing
   - Format conversion
   - Thumbnail generation

3. **Bulk Upload**:
   - Multiple image upload
   - CSV import with images

4. **Image Management**:
   - Delete unused images
   - Image optimization
   - CDN integration

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your Google Sheets permissions
3. Check backend logs for errors
4. Test API endpoints manually
5. Ensure file permissions are correct

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Node.js 18+, Express.js 4.19+
