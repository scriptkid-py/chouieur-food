/**
 * Google Sheets Service for Menu Items
 * Read/write menu items from Google Sheets; fallback to MongoDB when unavailable
 */

const { google } = require('googleapis');
require('dotenv').config();

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

let sheetsClient = null;

const SHEET_NAME = 'MenuItems';
const HEADERS = [
  'id', 'name', 'category', 'price', 'megaPrice', 'description', 'imageId', 'imageUrl', 'isActive', 'createdAt', 'updatedAt'
];

/**
 * Initialize Google Sheets client
 */
async function initGoogleSheets() {
  try {
    if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.warn('⚠️  Google Sheets credentials not configured, will use MongoDB only');
      return null;
    }

    const cleanPrivateKey = GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .trim();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: cleanPrivateKey,
      },
      // Need full read/write scope for CRUD
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets client initialized');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets:', error.message);
    return null;
  }
}

async function ensureInitialized() {
  if (!sheetsClient) {
    await initGoogleSheets();
  }
  return sheetsClient;
}

function rowToItem(row, index) {
  const [id, name, category, price, megaPrice, description, imageId, imageUrl, isActive, createdAt, updatedAt] = row;
  const priceValue = typeof price === 'number' ? price : parseFloat(String(price || 0));
  const megaPriceValue = (megaPrice != null && megaPrice !== '') ? (typeof megaPrice === 'number' ? megaPrice : parseFloat(String(megaPrice))) : undefined;
  return {
    id: String(id || `item-${index}`),
    name: String(name || ''),
    category: String(category || 'Pizza'),
    price: isNaN(priceValue) ? 0 : priceValue,
    megaPrice: (megaPriceValue !== undefined && !isNaN(megaPriceValue)) ? megaPriceValue : undefined,
    description: String(description || ''),
    imageId: String(imageId || ''),
    imageUrl: String(imageUrl || ''),
    isActive: isActive === 'TRUE' || isActive === 'true' || isActive === true,
    createdAt: createdAt || '',
    updatedAt: updatedAt || '',
  };
}

async function listMenuItems() {
  const client = await ensureInitialized();
  if (!client) return null;
  const response = await client.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${SHEET_NAME}!A2:K10000`,
  });
  const rows = response.data.values || [];
  return rows.map((row, idx) => rowToItem(row, idx));
}

async function getMenuItemById(id) {
  const items = await listMenuItems();
  if (!items) return null;
  return items.find(i => i.id === id) || null;
}

async function findRowIndexById(id) {
  const client = await ensureInitialized();
  if (!client) return -1;
  const response = await client.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${SHEET_NAME}!A2:A10000`,
  });
  const rows = response.data.values || [];
  const idx = rows.findIndex(r => (r[0] || '') === id);
  return idx >= 0 ? idx + 2 : -1; // +2 to account for header and 1-based index
}

async function createMenuItem(item) {
  const client = await ensureInitialized();
  if (!client) return null;
  const now = new Date().toISOString();
  const row = [
    item.id, item.name, item.category, item.price, item.megaPrice ?? '', item.description || '', item.imageId || '', item.imageUrl || '', item.isActive !== false ? 'TRUE' : 'FALSE', now, now
  ];
  await client.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${SHEET_NAME}!A:K`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return { ...item, createdAt: now, updatedAt: now };
}

async function updateMenuItem(id, updates) {
  const client = await ensureInitialized();
  if (!client) return null;
  const rowIndex = await findRowIndexById(id);
  if (rowIndex === -1) return null;
  // Get existing row
  const getRes = await client.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${SHEET_NAME}!A${rowIndex}:K${rowIndex}`,
  });
  const existing = getRes.data.values && getRes.data.values[0] ? getRes.data.values[0] : [];
  const current = rowToItem(existing, 0);
  const merged = {
    ...current,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  const row = [
    merged.id,
    merged.name,
    merged.category,
    merged.price,
    merged.megaPrice ?? '',
    merged.description || '',
    merged.imageId || '',
    merged.imageUrl || '',
    merged.isActive !== false ? 'TRUE' : 'FALSE',
    merged.createdAt || existing[9] || '',
    merged.updatedAt,
  ];
  await client.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${SHEET_NAME}!A${rowIndex}:K${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return merged;
}

async function deleteMenuItem(id) {
  const client = await ensureInitialized();
  if (!client) return false;
  const rowIndex = await findRowIndexById(id);
  if (rowIndex === -1) return false;
  await client.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEETS_ID,
    requestBody: {
      requests: [
        { deleteDimension: { range: { sheetId: 0, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex } } }
      ]
    }
  });
  return true;
}

// Initialize on module load
initGoogleSheets().catch(console.error);

module.exports = {
  initGoogleSheets,
  listMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  sheetsClient
};

