# 📋 Historical Orders Backup Location

## Where Orders Are Backed Up

When you click "Clean Old Orders" in the admin dashboard, all historical orders are backed up to **Google Sheets** before being deleted from MongoDB.

### 📍 Backup Location

**Google Sheets Spreadsheet:**
- **Spreadsheet ID**: Set in environment variable `GOOGLE_SHEETS_ID`
- **Sheet Name**: `"Historical Orders"`
- **Full URL Format**: `https://docs.google.com/spreadsheets/d/{GOOGLE_SHEETS_ID}`

### 📊 What Data Is Saved

Each order is saved with the following columns in the "Historical Orders" sheet:

1. **Order ID** - Unique order identifier
2. **Customer Name** - Customer's name
3. **Customer Phone** - Customer's phone number
4. **Customer Address** - Delivery address
5. **Items (JSON)** - Order items in JSON format
6. **Total** - Order total amount
7. **Status** - Order status (pending, confirmed, ready, delivered, etc.)
8. **Order Type** - Delivery or pickup
9. **Payment Method** - Cash, card, etc.
10. **Created At** - When order was created
11. **Updated At** - Last update timestamp
12. **Delivered At** - Delivery completion time
13. **Assigned Driver** - Driver name
14. **Assigned Driver ID** - Driver identifier
15. **Notes** - Additional notes
16. **Archived At** - When the order was archived to Google Sheets

### 🔧 Code Location

The backup happens in:
- **File**: `api/services/order-archive-service.js`
- **Function**: `archiveOrdersToSheets(orders)`
- **Line**: ~199-206 (appends orders to Google Sheets)

### ✅ Safety Features

1. **Backup First**: Orders are ALWAYS archived to Google Sheets BEFORE deletion
2. **No Deletion on Failure**: If backup fails, orders are NOT deleted from MongoDB
3. **Automatic Sheet Creation**: The "Historical Orders" sheet is created automatically if it doesn't exist
4. **Header Row**: First row contains column headers with formatting

### 📝 How to Access Your Backup

1. Go to your Google Sheets dashboard
2. Find the spreadsheet with ID from `GOOGLE_SHEETS_ID` environment variable
3. Look for the sheet named **"Historical Orders"**
4. All archived orders will be there with complete information

### 🔍 Current Configuration

- **Sheet Name**: `Historical Orders` (defined in `ARCHIVE_SHEET_NAME` constant)
- **Google Sheets ID**: From `process.env.GOOGLE_SHEETS_ID`
- **Service Account**: From `process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL`

### ⚠️ Important Notes

- Orders are appended to the sheet (not overwritten)
- Each cleanup adds new rows to the bottom of the sheet
- The sheet grows over time with all historical orders
- You can always access your order history from Google Sheets

