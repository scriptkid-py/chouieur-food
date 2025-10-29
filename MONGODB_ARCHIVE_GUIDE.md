# MongoDB to Google Sheets Auto-Archive System

## Overview

This system automatically archives old orders from MongoDB to Google Sheets when the database reaches a certain threshold, preventing the database from filling up while preserving all historical data.

## How It Works

### Automatic Archiving

1. **Threshold Detection**: After each new order is created, the system checks if MongoDB has more than **1000 orders**
2. **Archive Trigger**: If threshold is exceeded, old completed orders are automatically archived
3. **Order Selection**: Only orders with status `delivered` or `cancelled` are archived
4. **Keep Recent**: The **100 most recent orders** are kept in MongoDB for fast access
5. **Archive to Sheets**: Old orders are saved to a Google Sheet named "Archived Orders"
6. **Cleanup**: Archived orders are deleted from MongoDB to free up space

### Configuration

Located in `api/services/archive-service.js`:

```javascript
const ARCHIVE_THRESHOLD = 1000;      // Archive when > 1000 orders
const KEEP_RECENT_ORDERS = 100;      // Keep 100 most recent in MongoDB
const ARCHIVE_STATUSES = ['delivered', 'cancelled']; // Only archive completed
```

## Google Sheets Setup

### Required Environment Variables

Add to your Vercel environment variables:

```env
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS_BASE64=your_base64_encoded_credentials
```

### Getting Credentials

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in details and create

4. **Generate Key**
   - Click on the service account you created
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format
   - Download the key file

5. **Encode Credentials**
   ```bash
   # Linux/Mac
   base64 -i credentials.json | tr -d '\n'
   
   # Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("credentials.json"))
   ```

6. **Share Google Sheet**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (from credentials.json)
   - Give "Editor" permissions

## API Endpoints

### 1. Check Archive Status

```bash
GET /api/archive/status
```

**Response:**
```json
{
  "success": true,
  "totalOrders": 1250,
  "threshold": 1000,
  "needsArchiving": true,
  "message": "Database has 1250 orders (threshold: 1000). Archiving recommended."
}
```

### 2. Manually Trigger Archive

```bash
POST /api/archive
```

**Response:**
```json
{
  "success": true,
  "archived": 150,
  "deleted": 150,
  "message": "Archived 150 orders to Google Sheets and deleted from MongoDB"
}
```

## Archive Sheet Format

The "Archived Orders" sheet will have these columns:

| Column | Description |
|--------|-------------|
| Order ID | Unique order identifier |
| Customer Name | Customer's full name |
| Customer Phone | Phone number |
| Customer Address | Delivery address |
| Items | Order items (formatted as "2x Pizza (mega); 1x Sandwich (regular)") |
| Total | Order total amount |
| Status | Final order status |
| Created At | When order was placed |
| Updated At | Last update timestamp |
| Order Type | delivery/pickup |
| Payment Method | cash/card |
| Archived At | When archived to sheets |

## Monitoring

### Check Current Order Count

```bash
curl https://your-domain.vercel.app/api/archive/status
```

### View Archive Logs

Check Vercel logs for archive activity:

```
📦 Auto-archived 150 old orders to Google Sheets
```

## Manual Archiving

### From Admin Dashboard

You can add an "Archive Old Orders" button in the admin dashboard:

```typescript
const handleArchive = async () => {
  const response = await fetch('/api/archive', { method: 'POST' });
  const result = await response.json();
  alert(`Archived ${result.archived} orders!`);
};
```

### From Command Line

```bash
curl -X POST https://your-domain.vercel.app/api/archive
```

## Troubleshooting

### Archive Not Working

1. **Check Credentials**
   ```bash
   # Test archive status
   curl https://your-domain.vercel.app/api/archive/status
   ```

2. **Verify Environment Variables**
   - GOOGLE_SHEET_ID is set
   - GOOGLE_SHEETS_CREDENTIALS_BASE64 is set
   - Service account has access to the sheet

3. **Check Logs**
   - View Vercel function logs
   - Look for "Archive" related messages

### Sheet Not Created

The system automatically creates the "Archived Orders" sheet if it doesn't exist. If it fails:

1. Manually create a sheet named "Archived Orders"
2. Add headers in the first row (see format above)

### Orders Not Being Archived

Check if:
- Total orders > ARCHIVE_THRESHOLD (1000)
- Orders have status "delivered" or "cancelled"
- Google Sheets credentials are valid

## Benefits

✅ **Never run out of database space** - Old orders automatically archived
✅ **Fast admin/kitchen pages** - Only recent orders in MongoDB
✅ **Complete history preserved** - All orders in Google Sheets
✅ **Automatic process** - No manual intervention needed
✅ **Cost effective** - MongoDB stays small, Google Sheets is free
✅ **Easy access** - View historical data in familiar spreadsheet format

## Adjusting Settings

### Change Archive Threshold

Edit `api/services/archive-service.js`:

```javascript
const ARCHIVE_THRESHOLD = 2000; // Archive at 2000 instead of 1000
```

### Keep More Recent Orders

```javascript
const KEEP_RECENT_ORDERS = 200; // Keep 200 instead of 100
```

### Archive Different Statuses

```javascript
const ARCHIVE_STATUSES = ['delivered', 'cancelled', 'ready'];
```

## Testing

### Test Archiving

1. Create test orders in MongoDB
2. When count exceeds 1000, archiving triggers automatically
3. Check Google Sheets for archived data
4. Verify orders removed from MongoDB

### Force Archive (Development)

```javascript
// In api/services/archive-service.js temporarily change:
const ARCHIVE_THRESHOLD = 10; // Test with 10 orders
```

## Support

If you need help:
1. Check Vercel logs for errors
2. Verify Google Sheets credentials
3. Test with `/api/archive/status` endpoint
4. Manually trigger with `/api/archive` endpoint

