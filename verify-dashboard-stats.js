const mongoose = require('mongoose');
const Appointment = require('./server/models/Appointment');
const Service = require('./server/models/Service');
const User = require('./server/models/User');
const api = require('axios');
require('dotenv').config({ path: './server/.env' });

async function verifyDashboardStats() {
    try {
        // 1. Connect to DB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB');

        // 2. Create Test Data
        const provider = await User.findOne({ email: 'provider1@test.com' });
        if (!provider) {
            throw new Error('Provider not found. Please run seed-test-users.js first.');
        }

        // Create a service created today (should count as new)
        const service = await Service.create({
            providerId: provider._id,
            name: 'Test Service',
            duration: 60,
            price: 100,
            category: 'Therapy'
        });
        console.log('✅ Created test service');

        // Create appointments
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's appointments (2)
        const endTime = new Date(today);
        endTime.setHours(endTime.getHours() + 1);

        await Appointment.create([
            { serviceId: service._id, clientId: provider._id, startTime: today, endTime: endTime, status: 'CONFIRMED' },
            { serviceId: service._id, clientId: provider._id, startTime: today, endTime: endTime, status: 'PENDING' }
        ]);

        // Yesterday's appointments (1)
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(yesterdayEnd.getHours() + 1);
        await Appointment.create([
            { serviceId: service._id, clientId: provider._id, startTime: yesterday, endTime: yesterdayEnd, status: 'COMPLETED' }
        ]);

        // Upcoming appointment (1) - Tomorrow
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(tomorrowEnd.getHours() + 1);
        await Appointment.create([
            { serviceId: service._id, clientId: provider._id, startTime: tomorrow, endTime: tomorrowEnd, status: 'CONFIRMED' }
        ]);

        console.log('✅ Created test appointments');

        // 3. Call API
        const response = await api.get(`http://localhost:5003/api/dashboard/stats`, {
            params: { providerId: provider._id.toString() }
        });
        // await Appointment.deleteMany({ serviceId: service._id });
        // await Service.deleteOne({ _id: service._id });
        await mongoose.disconnect();
    }
}

verifyDashboardStats();
