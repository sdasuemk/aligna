const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
    try {
        console.log('1. Testing Login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'provider@example.com',
            password: 'password123'
        });

        console.log('✅ Login Successful!');
        console.log('Token received:', !!loginResponse.data.token);
        console.log('User data:', loginResponse.data.user);

        const token = loginResponse.data.token;

        console.log('\n2. Testing Profile Fetch (with token)...');
        try {
            const profileResponse = await axios.get(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Profile Fetch Successful!');
            console.log('Profile data:', profileResponse.data);
        } catch (profileError) {
            console.error('❌ Profile Fetch Failed:', profileError.response?.data || profileError.message);
        }

    } catch (error) {
        console.error('❌ Login Failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testLogin();
