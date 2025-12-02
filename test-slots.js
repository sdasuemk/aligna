// Test script to debug slots endpoint
const axios = require('axios');

async function testSlots() {
    try {
        // First login to get token
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'client@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('✅ Logged in successfully');

        // Get a service to test with
        const servicesRes = await axios.get('http://localhost:5001/api/services', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const service = servicesRes.data[0];
        console.log('\n📋 Testing service:', service.name);
        console.log('Service ID:', service._id);
        console.log('Availability:', JSON.stringify(service.availability, null, 2));
        console.log('Max Capacity:', service.maxCapacity);
        console.log('Duration:', service.duration);

        // Test slots for Friday, Nov 28, 2025
        const testDate = '2025-11-28';
        console.log('\n🔍 Testing slots for:', testDate);

        const slotsRes = await axios.get(`http://localhost:5001/api/services/${service._id}/slots?date=${testDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n✅ Slots response:', JSON.stringify(slotsRes.data, null, 2));
        console.log('Total slots:', slotsRes.data.length);
        console.log('Available slots:', slotsRes.data.filter(s => s.available).length);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testSlots();
