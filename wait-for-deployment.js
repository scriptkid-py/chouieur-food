/**
 * Wait for backend deployment and test cleanup endpoint
 * Run: node wait-for-deployment.js
 */

const BACKEND_URL = 'https://chouieur-express-backend-h74v.onrender.com';
const MAX_ATTEMPTS = 30; // Check for 5 minutes (30 * 10 seconds)
const CHECK_INTERVAL = 10000; // 10 seconds

async function checkEndpoint() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orders/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

async function waitForDeployment() {
  console.log('⏳ Waiting for backend deployment...');
  console.log(`📍 Backend URL: ${BACKEND_URL}\n`);

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const isAvailable = await checkEndpoint();
    
    if (isAvailable) {
      console.log('✅ Backend deployed! Cleanup endpoint is available.\n');
      console.log('🧹 Triggering cleanup now...\n');
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/orders/cleanup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Cleanup completed successfully!');
          console.log('\n📊 Results:');
          console.log(JSON.stringify(result, null, 2));
        } else {
          const error = await response.text();
          console.log(`❌ Cleanup failed: ${response.status}`);
          console.log(error);
        }
      } catch (error) {
        console.error('❌ Error triggering cleanup:', error.message);
      }
      
      return;
    }
    
    const remaining = MAX_ATTEMPTS - i - 1;
    const minutes = Math.floor(remaining * 10 / 60);
    const seconds = (remaining * 10) % 60;
    console.log(`⏳ Still waiting... (${remaining} attempts remaining, ~${minutes}m ${seconds}s)`);
    
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  console.log('\n⏰ Timeout: Backend deployment is taking longer than expected.');
  console.log('📝 Please check Render dashboard manually:');
  console.log('   1. Go to https://dashboard.render.com');
  console.log('   2. Find "chouieur-express-backend" service');
  console.log('   3. Check deployment status');
  console.log('   4. If needed, click "Manual Deploy" → "Deploy latest commit"');
}

// Use node-fetch if available, otherwise use built-in fetch (Node 18+)
if (typeof fetch === 'undefined') {
  const fetch = require('node-fetch');
  waitForDeployment();
} else {
  waitForDeployment();
}

