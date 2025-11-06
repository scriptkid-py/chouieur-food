# Order Archive and Cleanup System

## Overview
This system automatically archives historical orders to Google Sheets and cleans old orders from the database every 24 hours.

## Features

### 1. Automatic Archiving
- Orders older than 24 hours are automatically archived to Google Sheets
- Historical orders are saved in a "Historical Orders" sheet
- All order data is preserved including items, customer info, status, etc.

### 2. Automatic Cleanup
- Orders older than 24 hours are automatically deleted from MongoDB
- Cleanup runs every 24 hours automatically
- Manual cleanup can be triggered via API endpoint

### 3. Recent Orders Only
- Admin dashboard only shows orders from the last 24 hours
- Delivery dashboard only shows orders from the last 24 hours
- Socket.io connections only receive recent orders

## How It Works

### Archive Process
1. Every 24 hours, the system finds all orders older than 24 hours
2. These orders are archived to Google Sheets in the "Historical Orders" sheet
3. After successful archiving, orders are deleted from MongoDB
4. Historical data is preserved in Google Sheets for reporting/analysis

### Google Sheets Structure
The "Historical Orders" sheet contains:
- Order ID
- Customer Name
- Customer Phone
- Customer Address
- Items (JSON format)
- Total
- Status
- Order Type
- Payment Method
- Created At
- Updated At
- Delivered At
- Assigned Driver
- Assigned Driver ID
- Notes
- Archived At (timestamp when archived)

## API Endpoints

### Manual Cleanup
```
POST /api/orders/cleanup
```
Manually trigger the cleanup process. Returns:
```json
{
  "success": true,
  "message": "Order cleanup completed",
  "archived": 10,
  "deleted": 10,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Get Orders (Recent Only)
```
GET /api/orders
```
Returns only orders from the last 24 hours. Response includes:
```json
{
  "success": true,
  "data": [...],
  "cutoffDate": "2024-01-01T00:00:00.000Z",
  "message": "Successfully fetched X recent orders (last 24 hours)"
}
```

## Configuration

### Environment Variables Required
- `GOOGLE_SHEETS_ID` - Your Google Sheets spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key

### Cleanup Schedule
- Runs automatically every 24 hours
- Starts when the server starts
- Can be manually triggered via API

## Files Created/Modified

### New Files
1. `api/services/order-archive-service.js` - Handles archiving to Google Sheets
2. `api/services/order-cleanup-service.js` - Handles cleanup logic

### Modified Files
1. `api/index.js` - Updated to:
   - Use `getRecentOrders()` for all order queries
   - Added cleanup scheduler (runs every 24 hours)
   - Added manual cleanup endpoint
   - Updated Socket.io to send only recent orders

## Testing

### Test Manual Cleanup
```bash
curl -X POST http://localhost:3001/api/orders/cleanup
```

### Verify Archive Sheet
1. Open your Google Sheets
2. Check for "Historical Orders" sheet
3. Verify archived orders are present

### Check Recent Orders Only
```bash
curl http://localhost:3001/api/orders
```
Should only return orders from the last 24 hours.

## Notes

- Orders are archived BEFORE deletion to ensure no data loss
- If archiving fails, orders are NOT deleted (safety first)
- The cleanup runs automatically - no manual intervention needed
- Historical data is always available in Google Sheets
- Admin and delivery pages automatically show only recent orders

