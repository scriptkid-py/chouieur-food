/**
 * =============================================================================
 * ENVIRONMENT SETUP SCRIPT
 * =============================================================================
 * 
 * This script helps you set up environment variables for MongoDB.
 * 
 * USAGE:
 * node setup-env.js
 */

const fs = require('fs');

function setupEnvironment() {
  console.log('🚀 Setting up environment for MongoDB...');
  
  const envContent = `# =============================================================================
# CHOUIEUR EXPRESS - MONGODB CONFIGURATION
# =============================================================================

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGO_URI=mongodb+srv://zaid:RrZLCt1iLTrxS5RZ@chouieur-express.657lqxf.mongodb.net/chouieur_express?retryWrites=true&w=majority&appName=chouieur-express

# Firebase Configuration (keep your existing values)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Performance Configuration
ENABLE_CACHE=true
CACHE_TTL=300
DB_POOL_SIZE=10
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 MongoDB connection string configured');
    console.log('🔧 Please update Firebase credentials in .env file');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('Please create .env file manually with the configuration above.');
  }
  
  console.log('\n🎉 Environment setup complete!');
  console.log('📈 Next steps:');
  console.log('1. Update Firebase credentials in .env file');
  console.log('2. Start the backend: npm run backend');
  console.log('3. Test the application: http://localhost:3000');
}

// Run setup
setupEnvironment();
