# Chouieur Express

A modern food ordering platform with separate frontend and backend for optimal deployment on Render.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js with Google Sheets integration
- **Database**: Google Sheets (production and development)
- **Deployment**: Render (separate services for frontend and backend)
- **Authentication**: Firebase Auth
- **AI Features**: Google Genkit for automation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Google account and Google Cloud Console access
- Google Sheets API enabled

### 1. Clone and Install
```bash
git clone https://github.com/scriptkid-py/chouieur-food.git
cd chouieur-food
npm run install:all
```

### 2. Set Up Google Sheets Database
```bash
# Follow the detailed setup guide
# See: GOOGLE_SHEETS_SETUP.md

# Backend environment
cd server
cp env.example .env
# Edit .env with your Google Sheets credentials

# Frontend environment (optional)
cd ../client
cp env.example .env.local
# Edit .env.local with your API URL
```

### 3. Run the Application

#### Option A: Development Mode (Recommended)
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:client  # Frontend on http://localhost:3000
npm run dev:server  # Backend on http://localhost:5000
```

#### Option B: Docker (Full Stack)
```bash
# Start all services with Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### 4. Test Your Setup
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health
- **Google Sheets:** Connected and ready
- **Test Integration:** `cd server && node test-sheets.js`

## 🗄️ Database Setup

### Google Sheets Database

This application uses **Google Sheets** as the database for both development and production.

#### Quick Setup
1. **Follow the detailed guide**: See `GOOGLE_SHEETS_SETUP.md`
2. **Create your Google Sheet** with the required tabs (Orders, MenuItems, Users)
3. **Set up service account** and get credentials
4. **Configure environment variables** in your `.env` file

#### Environment Configuration
```env
GOOGLE_SHEETS_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### Test Your Setup
```bash
cd server
node test-sheets.js
```

#### Database Structure
Your Google Sheet should have these tabs:
- **Orders**: Customer orders and delivery information
- **MenuItems**: Restaurant menu with pricing and categories  
- **Users**: User profiles and authentication data

## 🌐 Render Deployment

### Frontend/Backend Deployment
1. **Connect your GitHub repository to Render**
2. **Set environment variables in Render dashboard**:
   ```
   GOOGLE_SHEETS_ID=your_google_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   ```

### Database Configuration
**Your Google Sheets database is ready!** 

The application will automatically connect to your Google Sheet when deployed to Render.

#### Environment Variables for Render
| Variable | Value |
|----------|-------|
| `GOOGLE_SHEETS_ID` | Your Google Sheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Your service account email |
| `GOOGLE_PRIVATE_KEY` | Your service account private key |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.onrender.com` |

### Switching Google Sheets

#### To Use a Different Google Sheet
1. **Create a new Google Sheet** with the same structure
2. **Share it with your service account** email
3. **Update `GOOGLE_SHEETS_ID`** in Render environment variables
4. **Redeploy your application**

#### To Use Different Service Account
1. **Create a new service account** in Google Cloud Console
2. **Download the new JSON key**
3. **Update environment variables** in Render dashboard:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
4. **Redeploy your application**

## 🏗️ Project Structure

```
├── server/
│   ├── sheets.js       # Google Sheets connection
│   ├── server.js       # Server initialization
│   ├── models/         # Google Sheets data access
│   │   ├── Order.js    # Order operations
│   │   ├── MenuItem.js # Menu item operations
│   │   └── User.js     # User operations
│   ├── test-sheets.js  # Google Sheets integration test
│   └── env.example     # Environment variables template
├── client/
│   ├── src/
│   │   ├── app/        # Next.js App Router pages
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context providers
│   │   ├── firebase/   # Firebase configuration
│   │   ├── lib/        # Utilities and configurations
│   │   └── hooks/      # Custom React hooks
│   └── package.json    # Frontend dependencies
├── GOOGLE_SHEETS_SETUP.md # Detailed setup guide
└── deploy-to-render.ps1   # Automated deployment script
```

## 🔌 Database Connection Files

### `sheets.js` - Google Sheets Connection
- Handles Google Sheets connection using Google APIs
- Reads Google Sheets credentials from environment variables
- Provides error handling and connection status
- Logs "✅ Google Sheets Connected" on success

### `server.js` - Server Initialization
- Imports and initializes Google Sheets connection
- Handles server startup and database connection
- Provides API endpoints for frontend communication

### Usage in Your App
```javascript
// Import in your main app file
require('./server');

// Or import the connection function directly
const { connectToGoogleSheets } = require('./sheets');
await connectToGoogleSheets();
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Google Sheets with Google APIs
- **Authentication**: Firebase Auth
- **Deployment**: Render
- **Container**: Docker

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEETS_ID` | Google Sheet ID | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | `service@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep Google service account credentials secure
- Enable authentication in production
- Use Google Sheets for both development and production
- Regularly update dependencies

## 📞 Support

If you encounter issues:

1. Check Google Sheets setup: `cd server && node test-sheets.js`
2. Verify environment variables in `.env`
3. Check application logs for connection errors
4. Ensure Google Sheets API is enabled
5. Verify service account has access to the sheet

---

**Happy coding! 🚀**
