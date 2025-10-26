// Comprehensive API Testing Script
const https = require('https');

const API_BASE_URL = 'https://chouieur-express-pel5v8ww7-scriptkid-pys-projects.vercel.app';
const FRONTEND_URL = 'https://chouieur-express-g3zwe4ona-scriptkid-pys-projects.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            status: res.statusCode, 
            data: jsonData, 
            headers: res.headers,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data, 
            headers: res.headers,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
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

async function testAllEndpoints() {
  console.log('🧪 COMPREHENSIVE API TESTING REPORT');
  console.log('=====================================\n');
  
  const results = {
    backend: { success: 0, failed: 0, tests: [] },
    frontend: { success: 0, failed: 0, tests: [] }
  };
  
  try {
    // Test Frontend
    console.log('🌐 FRONTEND TESTING');
    console.log('-------------------');
    
    const frontendResponse = await makeRequest(FRONTEND_URL);
    results.frontend.tests.push({
      endpoint: 'Frontend Homepage',
      status: frontendResponse.status,
      success: frontendResponse.success
    });
    console.log(`✅ Frontend: ${frontendResponse.status} - ${frontendResponse.success ? 'WORKING' : 'ERROR'}`);
    console.log('');
    
    // Test Backend Endpoints
    console.log('🔧 BACKEND API TESTING');
    console.log('----------------------');
    
    // Test 1: Health Check
    console.log('1️⃣ Health Check...');
    try {
      const healthResponse = await makeRequest(`${API_BASE_URL}/api/health`);
      results.backend.tests.push({
        endpoint: '/api/health',
        status: healthResponse.status,
        success: healthResponse.success
      });
      console.log(`   Status: ${healthResponse.status} - ${healthResponse.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (healthResponse.data) {
        console.log(`   Response:`, JSON.stringify(healthResponse.data, null, 2));
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.backend.tests.push({
        endpoint: '/api/health',
        status: 'ERROR',
        success: false
      });
    }
    console.log('');
    
    // Test 2: Menu Items
    console.log('2️⃣ Menu Items...');
    try {
      const menuResponse = await makeRequest(`${API_BASE_URL}/api/menu-items`);
      results.backend.tests.push({
        endpoint: '/api/menu-items',
        status: menuResponse.status,
        success: menuResponse.success
      });
      console.log(`   Status: ${menuResponse.status} - ${menuResponse.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (menuResponse.data && Array.isArray(menuResponse.data)) {
        console.log(`   Found ${menuResponse.data.length} menu items`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.backend.tests.push({
        endpoint: '/api/menu-items',
        status: 'ERROR',
        success: false
      });
    }
    console.log('');
    
    // Test 3: Login
    console.log('3️⃣ Admin Login...');
    try {
      const loginBody = JSON.stringify({
        email: 'admin@chouieur.com',
        password: 'admin123'
      });
      
      const loginResponse = await makeRequest(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginBody)
        },
        body: loginBody
      });
      
      results.backend.tests.push({
        endpoint: '/api/login',
        status: loginResponse.status,
        success: loginResponse.success
      });
      console.log(`   Status: ${loginResponse.status} - ${loginResponse.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (loginResponse.data && loginResponse.data.token) {
        console.log(`   ✅ JWT Token received`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.backend.tests.push({
        endpoint: '/api/login',
        status: 'ERROR',
        success: false
      });
    }
    console.log('');
    
    // Test 4: Orders
    console.log('4️⃣ Orders...');
    try {
      const ordersResponse = await makeRequest(`${API_BASE_URL}/api/orders`);
      results.backend.tests.push({
        endpoint: '/api/orders',
        status: ordersResponse.status,
        success: ordersResponse.success
      });
      console.log(`   Status: ${ordersResponse.status} - ${ordersResponse.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.backend.tests.push({
        endpoint: '/api/orders',
        status: 'ERROR',
        success: false
      });
    }
    console.log('');
    
    // Calculate results
    results.frontend.tests.forEach(test => {
      if (test.success) results.frontend.success++;
      else results.frontend.failed++;
    });
    
    results.backend.tests.forEach(test => {
      if (test.success) results.backend.success++;
      else results.backend.failed++;
    });
    
    // Summary
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`🌐 Frontend: ${results.frontend.success}/${results.frontend.tests.length} tests passed`);
    console.log(`🔧 Backend: ${results.backend.success}/${results.backend.tests.length} tests passed`);
    console.log(`📈 Overall Success Rate: ${Math.round(((results.frontend.success + results.backend.success) / (results.frontend.tests.length + results.backend.tests.length)) * 100)}%`);
    console.log('');
    
    console.log('📋 DETAILED RESULTS:');
    console.log('Frontend:');
    results.frontend.tests.forEach(test => {
      const icon = test.success ? '✅' : '❌';
      console.log(`  ${icon} ${test.endpoint} - Status: ${test.status}`);
    });
    
    console.log('Backend:');
    results.backend.tests.forEach(test => {
      const icon = test.success ? '✅' : '❌';
      console.log(`  ${icon} ${test.endpoint} - Status: ${test.status}`);
    });
    
    console.log('');
    console.log('🎯 NEXT STEPS:');
    if (results.backend.failed > 0) {
      console.log('❌ Backend issues detected:');
      console.log('   1. Check MongoDB Atlas connection');
      console.log('   2. Verify environment variables in Vercel');
      console.log('   3. Check Vercel deployment logs');
    }
    if (results.frontend.success > 0 && results.backend.success > 0) {
      console.log('✅ Both frontend and backend are working!');
      console.log('   Ready for production use!');
    }
    
  } catch (error) {
    console.error('❌ Critical error during testing:', error.message);
  }
}

testAllEndpoints();
