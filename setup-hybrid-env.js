/**
 * =============================================================================
 * HYBRID ENVIRONMENT SETUP SCRIPT
 * =============================================================================
 * 
 * This script sets up environment variables for the hybrid MongoDB + Google Sheets system.
 * 
 * USAGE:
 * node setup-hybrid-env.js
 */

const fs = require('fs');

function setupHybridEnvironment() {
  console.log('🚀 Setting up hybrid MongoDB + Google Sheets environment...');
  
  const envContent = `# =============================================================================
# CHOUIEUR EXPRESS - HYBRID MONGODB + GOOGLE SHEETS CONFIGURATION
# =============================================================================

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration (Primary Database)
MONGO_URI=mongodb+srv://zaid:RrZLCt1iLTrxS5RZ@chouieur-express.657lqxf.mongodb.net/chouieur_express?retryWrites=true&w=majority&appName=chouieur-express

# Google Sheets Configuration (Archive Database)
GOOGLE_SHEETS_ID=13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk
GOOGLE_SERVICE_ACCOUNT_EMAIL=chouieur-express-service@chouieur-express-sheets-475416.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEuQIBADANBgkqhkiG9w0BAQEFAASCBKMwggSfAgEAAoIBAQCkeNCzJg/NQnLI\\nfEamr0qBMs8xHotTyyeBESFahBO+3M0PwyQhxJMkXDcDbSo3TTHho6TdsMtdtHpm\\nht/e0RO/DNqkCWhsWSVLBcjnX0OjU9lC5bCDw8H5GOBmDBsHhAHN4fTpVfTaLdou\\n15mw8dyiuGZQpPe0hNzrnvddB+7dPfFuY9Kn2gY+8RxvCIUKOzSMBkZksZI7+Bcs\\nAcr3GZ1rhIqR+jSFLApfVREKlxjM2qzqGQ9aOs63lWIFGGgI2Qb7xfC8P+rgDabD\\nof15FP/ftwsOBghtuqqnT/qABHrE7Vzd3Py1KlsdFLwQBua1+ULkSuq8tmWnJFew\\nXIIyASwnAgMBAAECgf8gR+oftN8Ixr7Vnu9DMOFRTDZaIiawLjficSInVlwUQ/JX\\n4n+mSwPEbuwRu+XY00FPNk0hV3zeXO5yomr6N3f4cHAMQAc2awFxTzelq48Qe0cx\\nmyqx17X7sDow6qTY+o28beiCUMWP4xOsk3ZLWXBdg9w0uOThE/PKfY6u6kzNrhIO\\nofJIIQabdnU5UxQtXywxJVbqX3j7bhQ+xQ2ydYm29k3EJn4T/bwPCFNXSbTH8Qv5\\n7Ql5JdZTbMemOuO9hmKLi19czcIlzgAVSNutgC8HeJZc4L01AlKzvB8tqUj86A8U\\nc393PsuX2rJJWdvpgcu+9iNuelNbatwpA/w3oJECgYEA5Tl3v3KIm/X02uiLu1eU\\nosGohDYYLAKC92p8IBOKoGnQNjYnHfcgFLtY0YXY4h0zhUh4xfdwE3ZIEJLAKViq\\nTQW9np0UnmsZCxQOJoAw32+3QC8UwjaLk5KI+YtOQZpqNaUShGg2GnXQbu25mxm6\\nQA5LKHxoIy8SldZkLhlWHJkCgYEAt68K9ekCwX20mDuBgnwnFXmQK/HBbzCZZTtm\\n1DF2p5hWxb9+PxG4uNTyhcexnKbBrISy7aXWrjv1FFi8Zm3smwjZ4kGvZtjnfhr1\\nBsXIr2cmlIIdsNwsY6P52SPBTyqJ2NzSYlbdik8Y5ZlU/VglmqVfJbrefUaDPt3c\\nhpxwRr8Cf3x1t487oPENmuVBXp1Z8FpuzBD9TiKXOoUcTEkeUybGTUciIBslE0Yu\\ncwtQoXIkaNT1hJ34u+HVV0uoYq4QdmdbtplosMlTXUWmnghJkj+/aMBwz9SjySVX\\nawgTm2oDbaey+VrrOnUjgwi4Cw8r6PTezfAtnF1+MZkpzzs4hokCgYBTNUBJ1Zwh\\n+sfsjkhEy+kImWDuBz4RGHrkmNwkE6Qkl6X3Pp/6AhUj5ZNXdvbGd+QUOqizbwSp\\nOQ/0f54Y6ILeWEwbapYCiQ+U2LFWuBIJIzke3TKGA7c4C/gKnV/cdPCtBJtpYOBK\\n3znwCF2vxlaCj5diiBxxs5eQywAzGnriEQKBgQCy+HLduJ6XvuiYZ53GGKW8/Qhx\\n9dWHATY6tJc7n6UycmbkMBj4tis6bWzNejkJft9XJN1YYnH2HdJigMuovTym217c\\nuNOJe+VuetvNfbEpoI0ZiGrrqpU5qc2A3hahlmCk9SmaaFZOZNrjotOWOfjx8zdG\\nb2WYwFhEXv6wgakMHQ==\\n-----END PRIVATE KEY-----\\n"

# Firebase Configuration (for authentication)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Performance Configuration
ENABLE_CACHE=true
CACHE_TTL=300
DB_POOL_SIZE=10
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Hybrid System Configuration
MONGODB_MAX_ORDERS=1000
MONGODB_MAX_MENU_ITEMS=100
ARCHIVE_THRESHOLD=0.8
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Hybrid environment file created successfully!');
    console.log('📝 MongoDB configured as primary database');
    console.log('📦 Google Sheets configured as archive database');
    console.log('🔧 Please update Firebase credentials in .env file');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('Please create .env file manually with the configuration above.');
  }
  
  console.log('\n🎉 Hybrid environment setup complete!');
  console.log('📈 How the hybrid system works:');
  console.log('   • MongoDB Atlas: Primary database (fast, for active data)');
  console.log('   • Google Sheets: Archive database (unlimited, for old data)');
  console.log('   • Automatic archiving when MongoDB gets 80% full');
  console.log('   • Smart data retrieval from both sources');
  console.log('   • Seamless user experience');
  console.log('\n🚀 Next steps:');
  console.log('1. Update Firebase credentials in .env file');
  console.log('2. Start the hybrid backend: npm run backend:hybrid');
  console.log('3. Test the application: http://localhost:3000');
}

// Run setup
setupHybridEnvironment();
