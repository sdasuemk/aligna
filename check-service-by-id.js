// Check exact service by ID
const axios = require('axios');

async function checkServiceById() {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'client@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        const serviceId = '69209f3869224b7257bef9d9';

        console.log('🔍 Fetching service:', serviceId);
        const serviceRes = await axios.get(`http://localhost:5001/api/services/${serviceId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const service = serviceRes.data;

        console.log('\n📋 Service:', service.name);
        console.log('Duration:', service.duration, 'minutes');
        console.log('Max Capacity:', service.maxCapacity);
        console.log('\n🗓️ RAW Availability from database:');
        console.log(JSON.stringify(service.availability, null, 2));

        console.log('\n✅ Days with slots:');
        if (service.availability) {
            Object.keys(service.availability).forEach(day => {
                if (service.availability[day] && service.availability[day].length > 0) {
                    console.log(`  ${day}:`, service.availability[day]);
                }
            });
        }

        // Test Monday (Dec 2, 2025)
        console.log('\n\n🧪 Testing MONDAY Dec 2, 2025:');
        const monSlots = await axios.get(`http://localhost:5001/api/services/${serviceId}/slots?date=2025-12-02`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Slots returned:', monSlots.data.length);
        if (monSlots.data.length > 0) {
            console.log('✅ Slots:', monSlots.data.map(s => `${s.time} (${s.available ? 'available' : 'booked'})`));
        }

        // Test Friday (Nov 28, 2025)
        console.log('\n🧪 Testing FRIDAY Nov 28, 2025:');
        const friSlots = await axios.get(`http://localhost:5001/api/services/${serviceId}/slots?date=2025-11-28`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Slots returned:', friSlots.data.length);
        if (friSlots.data.length > 0) {
            console.log('✅ Slots:', friSlots.data.map(s => `${s.time} (${s.available ? 'available' : 'booked'})`));
        } else {
            console.log('❌ No slots - Friday not in availability');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkServiceById();
