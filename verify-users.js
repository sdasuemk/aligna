require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');

async function verifyUsers() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        const users = await User.find({
            email: {
                $in: [
                    'provider1@test.com', 'provider2@test.com', 'provider3@test.com',
                    'client1@test.com', 'client2@test.com', 'client3@test.com'
                ]
            }
        });

        console.log(`Found ${users.length} test users.`);
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyUsers();
