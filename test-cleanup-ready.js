/**
 * Test script to check if the cleanup endpoint is ready
 */

const BACKEND_URL = 'https://chouieur-express-backend-h74v.onrender.com';

async function testCleanupEndpoint() {
  try {
    console.log('🧪 Testing cleanup endpoint...');
    const response = await fetch(`${BACKEND_URL}/api/orders/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      console.log('❌ Endpoint not found (404) - Backend not yet deployed with new code');
      console.log('📝 Please trigger manual deployment on Render dashboard');
      return false;
    }

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cleanup endpoint is LIVE!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      const text = await response.text();
      console.log('Response:', text);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    return false;
  }
}

// Run the test
testCleanupEndpoint().then(success => {
  process.exit(success ? 0 : 1);
});

