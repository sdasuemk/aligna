// Check mock test service
const axios = require('axios');

async function checkMockTest() {
    try {
        const serviceId = '69266f3ecacc291af92c796b';

        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'client@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;

        const serviceRes = await axios.get(`http://localhost:5001/api/services/${serviceId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const service = serviceRes.data;

        console.log('Service:', service.name);
        console.log('Duration:', service.duration, 'min');
        console.log('Max Capacity:', service.maxCapacity);
        console.log('\nAvailability:');
        console.log(JSON.stringify(service.availability, null, 2));

        // Check what day Nov 28, 2025 is
        const testDate = new Date(2025, 10, 28); // month is 0-indexed
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayOfWeek = days[testDate.getDay()];
        console.log(`\nNov 28, 2025 is: ${dayOfWeek} (getDay: ${testDate.getDay()})`);

        // Check if service has availability for that day
        if (service.availability && service.availability[dayOfWeek]) {
            console.log(`✅ Service HAS availability on ${dayOfWeek}:`, service.availability[dayOfWeek]);
        } else {
            console.log(`❌ Service has NO availability on ${dayOfWeek}`);
        }

        // Test slots endpoint
        console.log('\n🧪 Testing slots endpoint for 2025-11-28:');
        const slotsRes = await axios.get(`http://localhost:5001/api/services/${serviceId}/slots?date=2025-11-28`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response:', slotsRes.data);
        console.log('Slots count:', slotsRes.data.length);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkMockTest();
