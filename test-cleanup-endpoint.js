/**
 * Test script to check if cleanup endpoint is available
 * Run: node test-cleanup-endpoint.js
 */

const BACKEND_URL = 'https://chouieur-express-backend-h74v.onrender.com';

async function testCleanup() {
  try {
    console.log('🔍 Testing cleanup endpoint...');
    console.log(`📍 Backend URL: ${BACKEND_URL}\n`);

    const response = await fetch(`${BACKEND_URL}/api/orders/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cleanup completed!');
      console.log('📊 Results:');
      console.log(JSON.stringify(result, null, 2));
    } else if (response.status === 404) {
      console.log('❌ Cleanup endpoint not found (404)');
      console.log('⚠️  The backend needs to be redeployed with the new code.');
      console.log('\n📝 To deploy:');
      console.log('1. Go to Render dashboard');
      console.log('2. Find "chouieur-express-backend" service');
      console.log('3. Click "Manual Deploy" → "Deploy latest commit"');
    } else {
      const error = await response.text();
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      console.log(error);
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('\n⚠️  Make sure the backend is running and accessible.');
  }
}

// Use node-fetch if available, otherwise use built-in fetch (Node 18+)
if (typeof fetch === 'undefined') {
  const fetch = require('node-fetch');
  testCleanup();
} else {
  testCleanup();
}

