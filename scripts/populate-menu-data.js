/**
 * Populate Menu Data Script
 * This script populates the Google Sheets with menu data
 */

const { google } = require('googleapis');
require('dotenv').config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function populateMenuData() {
  try {
    // Clean the private key
    const cleanPrivateKey = GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .trim();

    // Create GoogleAuth with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: cleanPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create sheets API instance
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('🍕 Populating menu data...');

    // Sample menu items data
    const sampleMenuItems = [
      ['sandwich-pilon', 'Sandwich Pilon', 'Sandwiches', 350, '', 'A signature sandwich with savory fillings.', 'sandwich-pilon', 'TRUE'],
      ['pizza-fromage', 'Pizza Fromage', 'Pizza', 900, 1000, 'A classic cheese pizza with a rich tomato base.', 'pizza-fromage', 'TRUE'],
      ['tacos-viande', 'Tacos Viande', 'Tacos', 350, '', 'Flavorful meat tacos with fresh toppings.', 'tacos-viande', 'TRUE'],
      ['poulet-marine', 'Poulet Mariné', 'Poulet', 350, '', 'Marinated and grilled chicken, tender and juicy.', 'poulet-marine', 'TRUE'],
      ['hamburger-double-cheese', 'Hamburger Double Cheese', 'Hamburgers', 500, '', 'A hearty double cheeseburger with all the fixings.', 'hamburger-double-cheese', 'TRUE'],
      ['panini-classic', 'Panini Classic', 'Panini / Fajitas', 400, '', 'A classic pressed panini with melted cheese.', 'panini', 'TRUE'],
      ['fajitas-poulet', 'Fajitas Poulet', 'Panini / Fajitas', 600, '', 'Sizzling chicken fajitas with peppers and onions.', 'fajitas', 'TRUE'],
      ['plat-du-jour', 'Plat du Jour', 'Plats', 800, '', 'The special plate of the day.', 'plat', 'TRUE']
    ];

    // Clear existing data and add headers
    await sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A:H'
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A1:H1',
      valueInputOption: 'RAW',
      resource: {
        values: [['ID', 'Name', 'Category', 'Price', 'MegaPrice', 'Description', 'ImageId', 'IsActive']]
      }
    });

    // Add menu items
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'MenuItems!A2:H9',
      valueInputOption: 'RAW',
      resource: {
        values: sampleMenuItems
      }
    });

    console.log('✅ Menu data populated successfully!');
    console.log('📊 Added 8 menu items to Google Sheets');

  } catch (error) {
    console.error('❌ Error populating menu data:', error.message);
  }
}

// Run the population
populateMenuData();
