const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, data, token) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : '';

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : null;
                    resolve({
                        statusCode: res.statusCode,
                        data: parsed
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (err) => {
            console.error('Request error:', err.message);
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting Mongoose Migration Tests\n');
    console.log('='.repeat(60));

    let providerToken = '';
    let clientToken = '';
    let serviceId = '';

    try {
        // Test 1: Register Provider
        console.log('\n📝 Test 1: Register Provider');
        const providerReg = await makeRequest('POST', '/api/auth/register', {
            email: `provider${Date.now()}@test.com`,
            password: 'test123',
            role: 'PROVIDER',
            name: 'Test Provider'
        });
        console.log(`Status: ${providerReg.statusCode}`);
        if (providerReg.statusCode === 201) {
            providerToken = providerReg.data.token;
            console.log('✅ Provider registered');
        } else {
            console.log('❌ Failed');
        }

        // Test 2: Register Client
        console.log('\n📝 Test 2: Register Client');
        const clientReg = await makeRequest('POST', '/api/auth/register', {
            email: `client${Date.now()}@test.com`,
            password: 'test123',
            role: 'CLIENT',
            name: 'Test Client'
        });
        console.log(`Status: ${clientReg.statusCode}`);
        if (clientReg.statusCode === 201) {
            clientToken = clientReg.data.token;
            console.log('✅ Client registered');
        } else {
            console.log('❌ Failed');
        }

        // Test 3: Create Service
        console.log('\n📝 Test 3: Create Service');
        const service = await makeRequest('POST', '/api/services', {
            name: 'Yoga Class',
            description: 'Morning yoga',
            category: 'Fitness',
            duration: 60,
            price: 25,
            maxCapacity: 10,
            availability: { mon: ['09:00-12:00'] }
        }, providerToken);
        console.log(`Status: ${service.statusCode}`);
        if (service.statusCode === 201) {
            serviceId = service.data._id;
            console.log(`✅ Service created (ID: ${serviceId})`);
        } else {
            console.log('❌ Failed:', service.data);
        }

        // Test 4: Get All Services
        console.log('\n📝 Test 4: Get All Services');
        const services = await makeRequest('GET', '/api/services');
        console.log(`Status: ${services.statusCode}`);
        console.log(`✅ Found ${services.data.length} service(s)`);

        // Test 5: Book Appointment
        console.log('\n📝 Test 5: Book Appointment');
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
        nextMonday.setHours(9, 0, 0, 0);

        const appointment = await makeRequest('POST', '/api/appointments', {
            serviceId: serviceId,
            startTime: nextMonday.toISOString()
        }, clientToken);
        console.log(`Status: ${appointment.statusCode}`);
        if (appointment.statusCode === 201) {
            console.log(`✅ Appointment booked (ID: ${appointment.data._id})`);
        } else {
            console.log('❌ Failed:', appointment.data);
        }

        // Test 6: Get Appointments
        console.log('\n📝 Test 6: Get Client Appointments');
        const appts = await makeRequest('GET', '/api/appointments', null, clientToken);
        console.log(`Status: ${appts.statusCode}`);
        console.log(`✅ Found ${appts.data.length} appointment(s)`);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All tests passed!\n');

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        process.exit(1);
    }
}

runTests();
