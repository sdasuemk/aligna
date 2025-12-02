// Check all services and their availability
const axios = require('axios');

async function checkAllServices() {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'client@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;

        const servicesRes = await axios.get('http://localhost:5001/api/services', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📋 All Services:\n');
        servicesRes.data.forEach((service, index) => {
            console.log(`${index + 1}. ${service.name} (ID: ${service._id})`);
            console.log(`   Availability:`, JSON.stringify(service.availability));
            console.log(`   Available days:`, service.availability ? Object.keys(service.availability).filter(day => service.availability[day].length > 0).join(', ') : 'None');
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkAllServices();
