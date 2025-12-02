const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Notification = require('./models/Notification');
const User = require('./models/User');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const testNotification = async () => {
    await connectDB();

    try {
        // Find a user to notify (e.g., the first provider found)
        const user = await User.findOne({ role: 'PROVIDER' });
        if (!user) {
            console.log('No provider found to notify');
            process.exit(0);
        }

        console.log(`Creating notification for user: ${user.email} (${user._id})`);

        const notification = new Notification({
            recipient: user._id,
            type: 'SYSTEM',
            title: 'Test Notification',
            message: 'This is a test notification from the verification script.',
            isRead: false
        });

        await notification.save();
        console.log('Notification created successfully:', notification);

    } catch (error) {
        console.error('Error creating notification:', error);
    } finally {
        mongoose.connection.close();
    }
};

testNotification();
