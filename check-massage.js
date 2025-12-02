// Check specific service by name
const axios = require('axios');

async function checkMassageService() {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'client@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;

        const servicesRes = await axios.get('http://localhost:5001/api/services', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const massageService = servicesRes.data.find(s => s.name.includes('Massage'));

        if (!massageService) {
            console.log('❌ Service not found');
            return;
        }

        console.log('📋 Full Body Massage & Spa Treatment');
        console.log('ID:', massageService._id);
        console.log('Max Capacity:', massageService.maxCapacity);
        console.log('Duration:', massageService.duration, 'minutes');
        console.log('\n🗓️ Availability:');
        console.log(JSON.stringify(massageService.availability, null, 2));

        if (massageService.availability) {
            const availableDays = Object.keys(massageService.availability).filter(day =>
                massageService.availability[day] && massageService.availability[day].length > 0
            );
            console.log('\n✅ Available on:', availableDays.join(', '));

            // Test Friday specifically
            console.log('\n🔍 Checking Friday (fri):');
            if (massageService.availability.fri) {
                console.log('  Time slots:', massageService.availability.fri);
            } else {
                console.log('  ❌ No availability on Friday!');
            }

            // Test Monday specifically
            console.log('\n🔍 Checking Monday (mon):');
            if (massageService.availability.mon) {
                console.log('  Time slots:', massageService.availability.mon);
            } else {
                console.log('  ❌ No availability on Monday!');
            }
        }

        // Test slots endpoint for Friday Nov 28
        console.log('\n\n🧪 Testing slots endpoint for Friday, Nov 28, 2025:');
        const slotsRes = await axios.get(`http://localhost:5001/api/services/${massageService._id}/slots?date=2025-11-28`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Slots returned:', slotsRes.data.length);
        if (slotsRes.data.length > 0) {
            console.log('Sample slots:', slotsRes.data.slice(0, 5));
        } else {
            console.log('❌ No slots returned - service not available on Friday!');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkMassageService();
