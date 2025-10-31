# 🚀 Deploy Google Sheets Menu API to Render

This guide will help you deploy your backend API with Google Sheets integration to Render.

## ✅ Prerequisites

- ✅ Google Sheets credentials ready:
  - Sheet ID: `1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI`
  - Service Account: `chouieur-menu@iconic-medley-476514-j3.iam.gserviceaccount.com`
  - Private Key: (already configured)

## 📋 Step 1: Set Up Your Google Sheet

1. **Open your Google Sheet**: 
   - URL: `https://docs.google.com/spreadsheets/d/1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI/edit`

2. **Share the Sheet with Service Account**:
   - Click "Share" button (top right)
   - Add email: `chouieur-menu@iconic-medley-476514-j3.iam.gserviceaccount.com`
   - Give **Editor** permission
   - Click "Send"

3. **Create MenuItems Tab** (if it doesn't exist):
   - The sheet should have a tab named **"MenuItems"** (case-sensitive)
   - If it doesn't exist, create a new sheet tab and rename it to "MenuItems"

4. **Add Header Row** (if empty):
   - Row 1 should have these columns:
   ```
   id | name | category | price | megaPrice | description | imageId | imageUrl | isActive | createdAt | updatedAt
   ```

## 📋 Step 2: Configure Render Environment Variables

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Select your backend service: `chouieur-express-backend`

2. **Navigate to Environment Tab**
   - Click on "Environment" in the left sidebar

3. **Add These Environment Variables**:

   ```
   GOOGLE_SHEETS_ID=1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI
   ```

   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-menu@iconic-medley-476514-j3.iam.gserviceaccount.com
   ```

   ```
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6NXoAqVI+nmkH\nZghlGgHCDBjOoSS9r8t9SODEX7qneFJqBVMD++kPN65STaE1593jhGU7YrHbO6aQ\nfNycWsftSEHwaorr0lKTC5En/zx4obkAmfLmehTWgQkt+9WXGw0M7sqGVx32hA57\n/CxF/SqzqXUJiKaON65dAKlYE2rhd52GGT+Rj9bOfVqHL7X0hbstOmHtqtbT+S0X\njsxT8vH/B/KH9pYgCUL/fmPccy0ix7T0bq8vCYJhhE0EJzQVNs5Cd8OhRPCcbU0v\nm9khw1i+8v6O1G2ILCEWH6Gw8eHs++dSYgIyes/givubmoI2XyDp1VeDIp2ZMlPW\nT1qnQKCvAgMBAAECggEALlb/mSmKH65Begdg4HQz6swi4k1E/PXCQNgBo60lIOc3\nL05K5gtraQ+U0MOj8mvVEvlQThKWK3ZxUbTZHAoVhg385u1EzEInrZNr2NXSgTzR\n8v3c7pGEHQu4spphAb1IJqdIfF0yxjX/+sf7ZqGF3nc1+pzowizGNjvjaNlQOHKk\n7N9d9fynrKS4Y4joyu/ThV4X/HdEHTxbb8i0Nv31WRcF9Yde+NBXpJOtBRJQYsO7\ndEo7uFdjP9CA4vBNIvA/BFR+4u+fJn2iXSu8r5q1L8Z8HQN00ur5Ei67AktEZE2d\n3+GHyIWsIrmehDqKAOKGzRbPaLTrxPA2FgEwJ/jklQKBgQDfT3Sz7vxH+PqTrEV4\nKGp7HNmSfDJ2e4IshsSu4bCqLJus5N9qymtrSApOQSq1kmku4OmH32bAFWo+xTa5\nQJ5T7ieg4/dKT5zW36z9v+v9jHuquOKBgyCBiQSQp21GoBykWdbH7YqzTOLfr/m0\nCQ6+sqYCv5ApTDwo8Ub3gAiYTQKBgQDVd6UK4UgWVgzTbIaMcEPdguGj/qe3IXsc\nqO2m0WJRwctuNhz+HDvJv4Qx+VCXMN7inyjz8YrMCqLWqnjnVfGEJ3HbIDbBTcx4\nPvazFZD+IDFe2MTuTDNDvZxSu+Uk7s252O7PiHrphKGZYEZd+QFff48iSsB9/Mzu\nzDZmEfka6wKBgH/oIO5XOsV2xQAEsp3KeIMf2TdgT/8xazRZ1RpeRzSR7HExfw7J\n9pEyaES+atopjHm/dcPPoCjxmzNs/pVJf+aPCL/NE33K8AjbgViur1tBNixpTcPk\n+Z94fdblL2A+oWk51B4b31An/+MkBqCqd3mfFhuI4efltKe223E0MrgZAoGBAKbA\nptmf8Esafzxta5GrZShVxGPyWxtweRaDU9pbeF17cKmwded/MKlCBUdwhacFkyce\nw8QELLOFn3zngDjeZyMgGQ3e1Ucduhs4vEhbEX+isE5yMSwhtG43YTUz+CVosqZ6\nMttFtxZR+Fay4WUpTgxGvg5ArKv+XiwwtFH5uklvAoGAUKMki0xhqzQd4Jcucj25\nrzvXfUI0PTaNLt80jptPDksOgvV8vplzLNz/493iGYuBBa8pT3aIV5SxJqQjlfKd\nelNvNUHpSDutE/NPRlt1+4AXIpfAxfIQo/dB3NJ8YgtzlPlVAN6yamt1yXk1l45S\nlwr20+75ACQF4WnvyzHG9rM=\n-----END PRIVATE KEY-----\n"
   ```

   ```
   ADMIN_PASSWORD=your-secure-password-here
   ```
   **Important**: Replace `your-secure-password-here` with a strong password for admin access.

4. **Important Notes for GOOGLE_PRIVATE_KEY**:
   - ✅ Include the entire key with `\n` characters
   - ✅ Wrap in double quotes `"`
   - ✅ Copy the ENTIRE key from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----`
   - ✅ Keep the `\n` escape sequences (they represent newlines)

5. **Save Environment Variables**
   - Click "Save Changes"
   - Render will automatically redeploy your service

## 📋 Step 3: Deploy to Render

1. **Push Your Code** (if not already done):
   ```bash
   git add .
   git commit -m "Add Google Sheets menu API integration"
   git push origin master
   ```

2. **Render Auto-Deploys**:
   - Render automatically detects the push
   - Builds your application
   - Deploys with the new environment variables

3. **Monitor Deployment**:
   - Go to "Events" tab in Render dashboard
   - Watch for successful deployment (usually 2-3 minutes)

## 🧪 Step 4: Test Your API

After deployment completes, test your endpoints:

### 1. Health Check
```bash
curl https://chouieur-express-backend.onrender.com/api/health
```

### 2. Get All Menu Items (Public)
```bash
curl https://chouieur-express-backend.onrender.com/api/menu
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "source": "google-sheets",
  "count": 0
}
```

### 3. Admin Login
```bash
curl -X POST https://chouieur-express-backend.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-secure-password-here"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "your-secure-password-here",
  "expiresIn": "24h"
}
```

### 4. Create Menu Item (Admin)
```bash
curl -X POST https://chouieur-express-backend.onrender.com/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-password-here" \
  -d '{
    "name": "Test Burger",
    "category": "Food",
    "price": 12.99,
    "description": "Delicious test burger",
    "isActive": true
  }'
```

### 5. Update Menu Item (Admin)
```bash
curl -X PUT https://chouieur-express-backend.onrender.com/api/menu/[ITEM_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-password-here" \
  -d '{
    "name": "Updated Burger",
    "price": 14.99
  }'
```

### 6. Delete Menu Item (Admin)
```bash
curl -X DELETE https://chouieur-express-backend.onrender.com/api/menu/[ITEM_ID] \
  -H "Authorization: Bearer your-secure-password-here"
```

## 📋 Available API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `GET /api/menu-items` - Alias for `/api/menu` (frontend compatibility)
- `GET /api/menu-items/:id` - Alias for `/api/menu/:id`

### Admin Endpoints (Auth Required)
- `POST /api/admin/login` - Login to get admin token
- `POST /api/menu` - Create new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

**Auth Header Format:**
```
Authorization: Bearer your-admin-password
```

## 🔍 Troubleshooting

### Issue: "Failed to fetch from Google Sheets"

**Solution:**
1. Check that the sheet is shared with the service account email
2. Verify the sheet tab is named exactly "MenuItems"
3. Check Render logs for detailed error messages

### Issue: "Unauthorized" when creating/updating items

**Solution:**
1. Make sure you logged in first via `/api/admin/login`
2. Include the `Authorization: Bearer [token]` header
3. Verify `ADMIN_PASSWORD` is set in Render environment variables

### Issue: Environment variables not working

**Solution:**
1. Check that variables are set in Render dashboard
2. Redeploy your service after adding variables
3. Check Render logs to see if variables are loaded

### Issue: Sheet connection fails

**Solution:**
1. Verify `GOOGLE_PRIVATE_KEY` includes `\n` characters
2. Make sure the key is wrapped in double quotes
3. Check that service account has Editor access to the sheet
4. Verify `GOOGLE_SHEETS_ID` is correct (from the sheet URL)

## ✅ Success Checklist

- [ ] Google Sheet created and shared with service account
- [ ] MenuItems tab exists with proper headers
- [ ] All environment variables set in Render
- [ ] Backend deployed successfully
- [ ] Health check passes
- [ ] Can fetch menu items via API
- [ ] Admin login works
- [ ] Can create/update/delete menu items

## 🎉 Next Steps

Once deployed:
1. Your frontend will automatically use the new Google Sheets API
2. Menu items are synced in real-time with Google Sheets
3. Use the admin page to manage menu items
4. Changes reflect immediately on the menu page

**Your API URL:**
```
https://chouieur-express-backend.onrender.com
```

**Frontend should point to:**
```
NEXT_PUBLIC_API_URL=https://chouieur-express-backend.onrender.com
```

---

## 📝 Quick Reference

**Google Sheet URL:**
```
https://docs.google.com/spreadsheets/d/1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI/edit
```

**Service Account Email:**
```
chouieur-menu@iconic-medley-476514-j3.iam.gserviceaccount.com
```

**Environment Variables Needed:**
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `ADMIN_PASSWORD`

