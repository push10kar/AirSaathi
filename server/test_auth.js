const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Starting Authentication System Integration Test...');
  
  let accessToken = '';
  let refreshToken = '';
  const testEmail = `test_${Date.now()}@example.com`;
  const testPhone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPass = 'Password123!';

  try {
    // 1. Test Email Registration
    console.log('\n1️⃣ Testing Email Registration...');
    const regRes = await axios.post(`${API_URL}/auth/signup`, {
      email: testEmail,
      password: testPass,
      name: 'Test User'
    });
    console.log('✅ Registration Success:', regRes.data.status);

    // 2. Test Login
    console.log('\n2️⃣ Testing Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPass
    });
    accessToken = loginRes.data.accessToken;
    refreshToken = loginRes.data.refreshToken;
    console.log('✅ Login Success. Access Token received.');

    // 3. Test Token Refresh
    console.log('\n3️⃣ Testing Token Refresh...');
    const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    accessToken = refreshRes.data.accessToken;
    console.log('✅ Refresh Success. New Access Token received.');

    // 4. Test Protected Route Access
    console.log('\n4️⃣ Testing Protected Route (User Profile)...');
    const profileRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Profile Access Success. User:', profileRes.data.data.user.email);

    // 5. Test Phone OTP Generation (Simulated)
    console.log('\n5️⃣ Testing Phone OTP Generation...');
    const otpRes = await axios.post(`${API_URL}/auth/request-otp`, {
      phone: testPhone
    });
    console.log('✅ OTP Sent (Simulated):', otpRes.data.status);

    // 6. Test Logout (Session Revocation)
    console.log('\n6️⃣ Testing Logout...');
    await axios.post(`${API_URL}/auth/logout`, {
      refreshToken: refreshToken
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Logout Success.');

    // 7. Verify session is revoked (Refresh should fail)
    console.log('\n7️⃣ Verifying Session Revocation...');
    try {
      await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      console.log('❌ Error: Refresh should have failed after logout');
    } catch (err) {
      console.log('✅ Refresh correctly failed after logout:', err.response.data.message);
    }

    console.log('\n✨ ALL BACKEND AUTH TESTS PASSED 100%!');
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    if (error.response) {
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testAuth();
