/**
 * Google Sheets Service for Menu Items
 * Read menu items from Google Sheets, while orders stay in MongoDB
 */

const { google } = require('googleapis');
require('dotenv').config();

// Google Sheets configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

let sheetsClient = null;

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
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets client initialized');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets:', error.message);
    return null;
  }
}

/**
 * Get all menu items from Google Sheets
 */
async function getMenuItemsFromSheets() {
  try {
    if (!sheetsClient) {
      return null;
    }

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A2:I1000', // Skip header row
    });

    const rows = response.data.values || [];
    
    return rows.map((row, index) => {
      const [id, name, category, price, megaPrice, description, imageId, imageUrl, isActive] = row;
      
      const priceValue = typeof price === 'number' ? price : parseFloat(String(price || 0));
      const megaPriceValue = (megaPrice != null && megaPrice !== '') ? (typeof megaPrice === 'number' ? megaPrice : parseFloat(String(megaPrice))) : null;
      
      return {
        id: String(id || `item-${index}`),
        name: String(name || ''),
        category: String(category || 'Pizza'),
        price: isNaN(priceValue) ? 0 : priceValue,
        megaPrice: (megaPriceValue && !isNaN(megaPriceValue)) ? megaPriceValue : null,
        description: String(description || ''),
        imageId: String(imageId || ''),
        imageUrl: String(imageUrl || ''),
        isActive: isActive === 'TRUE' || isActive === 'true' || isActive === true,
      };
    }).filter(item => item.isActive);
    
  } catch (error) {
    console.error('❌ Error reading from Google Sheets:', error.message);
    return null;
  }
}

// Initialize on module load
initGoogleSheets().catch(console.error);

module.exports = {
  initGoogleSheets,
  getMenuItemsFromSheets,
  sheetsClient
};

