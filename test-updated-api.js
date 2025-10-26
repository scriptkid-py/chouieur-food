// Test API with Updated MongoDB URI
const https = require('https');

const API_BASE_URL = 'https://chouieur-express-jplpzuwv4-scriptkid-pys-projects.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API with Updated MongoDB URI...\n');
  
  try {
    // Test Health Check
    console.log('1️⃣ Health Check...');
    const health = await makeRequest(`${API_BASE_URL}/api/health`);
    console.log(`   Status: ${health.status} - ${health.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (health.data && typeof health.data === 'object') {
      console.log(`   Database Status: ${health.data.database?.status || 'unknown'}`);
      console.log(`   Database Host: ${health.data.database?.host || 'unknown'}`);
    }
    console.log('');
    
    // Test Menu Items
    console.log('2️⃣ Menu Items...');
    const menu = await makeRequest(`${API_BASE_URL}/api/menu-items`);
    console.log(`   Status: ${menu.status} - ${menu.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (menu.data && Array.isArray(menu.data)) {
      console.log(`   Found ${menu.data.length} menu items`);
    }
    console.log('');
    
    // Test Orders
    console.log('3️⃣ Orders...');
    const orders = await makeRequest(`${API_BASE_URL}/api/orders`);
    console.log(`   Status: ${orders.status} - ${orders.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('');
    
    // Test Login
    console.log('4️⃣ Admin Login...');
    const loginBody = JSON.stringify({
      email: 'admin@chouieur.com',
      password: 'admin123'
    });
    
    const login = await makeRequest(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginBody)
      },
      body: loginBody
    });
    
    console.log(`   Status: ${login.status} - ${login.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (login.data && login.data.token) {
      console.log(`   ✅ JWT Token received`);
    }
    console.log('');
    
    // Summary
    const tests = [health, menu, orders, login];
    const passed = tests.filter(t => t.status === 200).length;
    
    console.log('📊 FINAL RESULTS:');
    console.log('=================');
    console.log(`${passed}/${tests.length} tests passed (${Math.round(passed/tests.length*100)}%)`);
    
    if (passed === tests.length) {
      console.log('\n🎉 ALL TESTS PASSED! Your API is fully functional!');
      console.log('🚀 Ready for production use!');
    } else if (passed > 0) {
      console.log('\n⚠️  Partial success. Some endpoints working.');
    } else {
      console.log('\n❌ All tests failed. Check MongoDB Atlas settings.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAPI();
