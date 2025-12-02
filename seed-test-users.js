require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

async function seedTestUsers() {
    try {
        console.log('🌱 Starting test user seeding...\n');

        // Connect to MongoDB
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const providers = [
            {
                email: 'provider1@test.com',
                password: hashedPassword,
                role: 'PROVIDER',
                profile: {
                    name: 'Dr. Alice Smith',
                    bio: 'Expert in Cognitive Behavioral Therapy',
                    phone: '+1-555-0101',
                    address: '101 Medical Center Dr'
                }
            },
            {
                email: 'provider2@test.com',
                password: hashedPassword,
                role: 'PROVIDER',
                profile: {
                    name: 'Dr. Bob Jones',
                    bio: 'Specialist in Family Therapy',
                    phone: '+1-555-0102',
                    address: '202 Wellness Way'
                }
            },
            {
                email: 'provider3@test.com',
                password: hashedPassword,
                role: 'PROVIDER',
                profile: {
                    name: 'Dr. Carol White',
                    bio: 'Child Psychologist',
                    phone: '+1-555-0103',
                    address: '303 Kids Care Ln'
                }
            }
        ];

        const clients = [
            {
                email: 'client1@test.com',
                password: hashedPassword,
                role: 'CLIENT',
                profile: {
                    name: 'David Brown',
                    phone: '+1-555-0201'
                }
            },
            {
                email: 'client2@test.com',
                password: hashedPassword,
                role: 'CLIENT',
                profile: {
                    name: 'Eva Green',
                    phone: '+1-555-0202'
                }
            },
            {
                email: 'client3@test.com',
                password: hashedPassword,
                role: 'CLIENT',
                profile: {
                    name: 'Frank Miller',
                    phone: '+1-555-0203'
                }
            }
        ];

        // Create Providers
        console.log('👤 Creating providers...');
        for (const p of providers) {
            // Check if user exists
            const existing = await User.findOne({ email: p.email });
            if (!existing) {
                await User.create(p);
                console.log(`✅ Created provider: ${p.email}`);
            } else {
                console.log(`⚠️ Provider already exists: ${p.email}`);
            }
        }

        // Create Clients
        console.log('\n👤 Creating clients...');
        for (const c of clients) {
            const existing = await User.findOne({ email: c.email });
            if (!existing) {
                await User.create(c);
                console.log(`✅ Created client: ${c.email}`);
            } else {
                console.log(`⚠️ Client already exists: ${c.email}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Test users seeded successfully!\n');
        console.log('📝 Test Credentials (Password: password123):');
        providers.forEach(p => console.log(`   Provider: ${p.email}`));
        clients.forEach(c => console.log(`   Client: ${c.email}`));
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error seeding test users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

seedTestUsers();
