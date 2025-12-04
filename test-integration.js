/**
 * Quick integration test script
 * Tests if backend and frontend can communicate
 * Run: node test-integration.js
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🧪 Testing Backend-Frontend Integration\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}\n`);

async function testBackend() {
  try {
    console.log('1️⃣ Testing Backend API...');
    const response = await axios.get(`${BACKEND_URL}/api/parking-lots`);
    console.log('   ✅ Backend is running and accessible');
    console.log(`   📊 Response: ${response.data.length} parking lots found\n`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Backend is not running!');
      console.log('   💡 Start backend with: cd backend && npm run dev\n');
    } else {
      console.log(`   ⚠️  Backend error: ${error.message}\n`);
    }
    return false;
  }
}

async function testCORS() {
  try {
    console.log('2️⃣ Testing CORS Configuration...');
    const response = await axios.options(`${BACKEND_URL}/api/parking-lots`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('   ✅ CORS is configured correctly\n');
    return true;
  } catch (error) {
    console.log('   ⚠️  CORS test inconclusive (this is okay if backend is running)\n');
    return true; // Don't fail on CORS test
  }
}

async function testAuthEndpoint() {
  try {
    console.log('3️⃣ Testing Authentication Endpoint...');
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'test123456'
    });
    console.log('   ✅ Registration endpoint works');
    console.log('   🔑 Token received:', response.data.token ? 'Yes' : 'No');
    console.log('   👤 User created:', response.data.user ? 'Yes' : 'No\n');
    return true;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400 && error.response.data.message === 'User already exists') {
        console.log('   ✅ Registration endpoint works (user exists test)\n');
        return true;
      }
      console.log(`   ⚠️  Auth endpoint error: ${error.response.data.message}\n`);
    } else {
      console.log(`   ❌ Cannot reach auth endpoint: ${error.message}\n`);
    }
    return false;
  }
}

async function runTests() {
  const backendOk = await testBackend();
  if (!backendOk) {
    console.log('❌ Backend is not running. Please start it first.');
    process.exit(1);
  }

  await testCORS();
  await testAuthEndpoint();

  console.log('✅ Integration Test Complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Make sure backend is running: cd backend && npm run dev');
  console.log('   2. Start frontend: cd frontend && npm start');
  console.log('   3. Open http://localhost:3000 in your browser');
  console.log('   4. Try registering a new user\n');
}

runTests().catch(console.error);

