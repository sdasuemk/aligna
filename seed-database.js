require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./server/models/User');
const Service = require('./server/models/Service');
const Appointment = require('./server/models/Appointment');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        await User.deleteMany({});
        await Service.deleteMany({});
        await Appointment.deleteMany({});
        console.log('🧹 Cleared existing data\n');

        // Create Provider
        console.log('👤 Creating provider...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const provider = await User.create({
            email: 'provider@example.com',
            password: hashedPassword,
            role: 'PROVIDER',
            profile: {
                name: 'Dr. Sarah Johnson',
                bio: 'Licensed therapist with 10 years of experience',
                phone: '+1-555-0123',
                address: '123 Main St, New York, NY'
            }
        });
        console.log(`✅ Provider created: ${provider.email}`);

        // Create Client
        console.log('\n👤 Creating client...');
        const client = await User.create({
            email: 'client@example.com',
            password: hashedPassword,
            role: 'CLIENT',
            profile: {
                name: 'John Doe',
                phone: '+1-555-0456'
            }
        });
        console.log(`✅ Client created: ${client.email}`);

        // Create Services
        console.log('\n💼 Creating services...');
        const service1 = await Service.create({
            providerId: provider._id,
            name: 'Individual Therapy Session',
            description: 'One-on-one therapy session',
            category: 'Therapy',
            duration: 60,
            price: 150,
            currency: 'USD',
            maxCapacity: 1,
            availability: {
                mon: ['09:00-17:00'],
                tue: ['09:00-17:00'],
                wed: ['09:00-17:00'],
                thu: ['09:00-17:00'],
                fri: ['09:00-12:00']
            }
        });
        console.log(`✅ Service created: ${service1.name}`);

        const service2 = await Service.create({
            providerId: provider._id,
            name: 'Group Therapy',
            description: 'Group therapy session for anxiety management',
            category: 'Therapy',
            duration: 90,
            price: 75,
            currency: 'USD',
            maxCapacity: 8,
            availability: {
                wed: ['18:00-20:00'],
                sat: ['10:00-14:00']
            }
        });
        console.log(`✅ Service created: ${service2.name}`);

        // Create Sample Appointment
        console.log('\n📅 Creating sample appointment...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const endTime = new Date(tomorrow);
        endTime.setMinutes(endTime.getMinutes() + service1.duration);

        const appointment = await Appointment.create({
            serviceId: service1._id,
            clientId: client._id,
            startTime: tomorrow,
            endTime: endTime,
            status: 'CONFIRMED',
            notes: 'First session'
        });
        console.log(`✅ Appointment created: ${appointment.status}`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Database seeded successfully!\n');
        console.log('📊 Summary:');
        console.log(`   Users: ${await User.countDocuments()}`);
        console.log(`   Services: ${await Service.countDocuments()}`);
        console.log(`   Appointments: ${await Appointment.countDocuments()}`);
        console.log('\n📝 Test Credentials:');
        console.log('   Provider: provider@example.com / password123');
        console.log('   Client: client@example.com / password123');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

seedDatabase();
