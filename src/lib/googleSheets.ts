import { google } from 'googleapis';

const SHEET_NAME = 'MenuItems';

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID as string | undefined;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string | undefined;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY as string | undefined;

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

function cleanPrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
}

export async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials are not configured');
  }
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: cleanPrivateKey(GOOGLE_PRIVATE_KEY),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getSheetIdByTitle(title: string): Promise<number> {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.get({ spreadsheetId: GOOGLE_SHEETS_ID });
  const sheet = res.data.sheets?.find(s => s.properties?.title === title);
  if (!sheet || sheet.properties?.sheetId == null) {
    throw new Error(`Sheet '${title}' not found`);
  }
  return sheet.properties.sheetId;
}

export type MinimalMenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listMenuItemsFromSheet(): Promise<MinimalMenuItem[]> {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!A2:G10000`,
  });
  const rows = res.data.values || [];
  return rows.map((r) => {
    const [id, name, price, description, category, imageUrl, createdAt] = r;
    const priceNum = typeof price === 'number' ? price : parseFloat(String(price || 0));
    return {
      id: String(id || ''),
      name: String(name || ''),
      price: isNaN(priceNum) ? 0 : priceNum,
      description: String(description || ''),
      category: String(category || ''),
      imageUrl: String(imageUrl || ''),
      createdAt: createdAt ? String(createdAt) : undefined,
    } as MinimalMenuItem;
  });
}

export async function appendMenuItemRow(item: MinimalMenuItem) {
  const client = await getSheetsClient();
  const now = new Date().toISOString();
  const row = [
    item.id,
    item.name,
    item.price,
    item.description ?? '',
    item.category ?? '',
    item.imageUrl ?? '',
    now,
  ];
  await client.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!A:G`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return { ...item, createdAt: now } as MinimalMenuItem;
}

export async function deleteMenuItemRow({ id, name }: { id?: string; name?: string; }): Promise<boolean> {
  if (!id && !name) throw new Error('Either id or name must be provided');
  const client = await getSheetsClient();
  const valuesRes = await client.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!A2:B10000`, // A=id, B=name
  });
  const rows = valuesRes.data.values || [];
  let rowIndex = -1; // 1-based index including header
  for (let i = 0; i < rows.length; i++) {
    const [rid, rname] = rows[i];
    if ((id && String(rid) === String(id)) || (name && String(rname) === String(name))) {
      rowIndex = i + 2; // +2 for header row and 1-based
      break;
    }
  }
  if (rowIndex === -1) return false;

  const sheetId = await getSheetIdByTitle(SHEET_NAME);
  await client.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEETS_ID!,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex },
          },
        },
      ],
    },
  });
  return true;
}


