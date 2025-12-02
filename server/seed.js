const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs'); // Import bcrypt
const { subDays, addDays, startOfWeek, addHours } = require('date-fns');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await Appointment.deleteMany({});
        await Service.deleteMany({});
        await User.deleteMany({});

        console.log('Hashing passwords...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const clientPassword = await bcrypt.hash('password123', 10);

        console.log('Creating Providers...');
        const provider = await User.create({
            email: 'provider@example.com',
            password: hashedPassword,
            role: 'PROVIDER',
            profile: { name: 'Jane Doe', phone: '555-0100' }
        });

        const provider2 = await User.create({
            email: 'provider2@example.com',
            password: hashedPassword,
            role: 'PROVIDER',
            profile: { name: 'John Smith', phone: '555-0200' }
        });

        console.log('Creating Clients...');
        const clients = await User.insertMany([
            { email: 'client@example.com', password: clientPassword, role: 'CLIENT', profile: { name: 'Test Client', phone: '555-0000' } },
            { email: 'client1@example.com', password: clientPassword, role: 'CLIENT', profile: { name: 'Alice Smith', phone: '555-0101' } },
            { email: 'client2@example.com', password: clientPassword, role: 'CLIENT', profile: { name: 'Bob Jones', phone: '555-0102' } },
            { email: 'client3@example.com', password: clientPassword, role: 'CLIENT', profile: { name: 'Charlie Brown', phone: '555-0103' } },
            { email: 'client4@example.com', password: clientPassword, role: 'CLIENT', profile: { name: 'Diana Prince', phone: '555-0104' } },
            { email: 'client5@example.com', password: clientPassword, role: 'CLIENT', profile: { name: 'Evan Wright', phone: '555-0105' } },
        ]);

        console.log('Creating Services...');
        // 10 Services for Provider 1
        const services1 = await Service.insertMany([
            { providerId: provider._id, name: 'Haircut', category: 'Hair', duration: 60, price: 50 },
            { providerId: provider._id, name: 'Coloring', category: 'Hair', duration: 120, price: 150 },
            { providerId: provider._id, name: 'Styling', category: 'Hair', duration: 45, price: 80 },
            { providerId: provider._id, name: 'Manicure', category: 'Nails', duration: 30, price: 35 },
            { providerId: provider._id, name: 'Pedicure', category: 'Nails', duration: 45, price: 45 },
            { providerId: provider._id, name: 'Facial', category: 'Skincare', duration: 60, price: 90 },
            { providerId: provider._id, name: 'Massage', category: 'Wellness', duration: 60, price: 100 },
            { providerId: provider._id, name: 'Beard Trim', category: 'Hair', duration: 30, price: 25 },
            { providerId: provider._id, name: 'Highlights', category: 'Hair', duration: 90, price: 120 },
            { providerId: provider._id, name: 'Blow Dry', category: 'Hair', duration: 30, price: 40 },
        ]);

        // 5 Services for Provider 2
        const services2 = await Service.insertMany([
            { providerId: provider2._id, name: 'Deep Tissue Massage', category: 'Wellness', duration: 90, price: 130 },
            { providerId: provider2._id, name: 'Hot Stone Massage', category: 'Wellness', duration: 75, price: 110 },
            { providerId: provider2._id, name: 'Aromatherapy', category: 'Wellness', duration: 60, price: 95 },
            { providerId: provider2._id, name: 'Reflexology', category: 'Wellness', duration: 45, price: 70 },
            { providerId: provider2._id, name: 'Sports Massage', category: 'Wellness', duration: 60, price: 100 },
        ]);

        const services = [...services1, ...services2];

        console.log('Creating Appointments...');
        const appointments = [];
        const today = new Date();

        // Generate appointments for the last 30 days and next 7 days
        for (let i = -30; i <= 7; i++) {
            const date = addDays(today, i);
            // Random number of appointments per day (0-5)
            const numApts = Math.floor(Math.random() * 6);

            for (let j = 0; j < numApts; j++) {
                const client = clients[Math.floor(Math.random() * clients.length)];
                const service = services[Math.floor(Math.random() * services.length)];
                const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM

                const startTime = new Date(date);
                startTime.setHours(startHour, 0, 0, 0);

                const endTime = addHours(startTime, service.duration / 60);

                // Determine status based on date
                let status = 'CONFIRMED';
                if (i < 0) {
                    status = Math.random() > 0.1 ? 'COMPLETED' : 'CANCELLED';
                } else {
                    status = Math.random() > 0.8 ? 'PENDING' : 'CONFIRMED';
                }

                appointments.push({
                    serviceId: service._id,
                    clientId: client._id,
                    startTime,
                    endTime,
                    status,
                    notes: 'Test appointment'
                });
            }
        }

        await Appointment.insertMany(appointments);

        console.log(`Seeded ${appointments.length} appointments.`);
        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
