const Notification = require('../models/Notification');
const User = require('../models/User');
const webPush = require('web-push');

/**
 * Create a notification, save to DB, emit via Socket.io, and send Push Notification
 * @param {Object} io - Socket.io instance
 * @param {Object} data - Notification data
 * @param {string} data.recipient - User ID of recipient
 * @param {string} data.type - Notification type
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} [data.relatedId] - Related object ID (e.g. Appointment ID)
 */
const createNotification = async (io, { recipient, type, title, message, relatedId }) => {
    try {
        // 1. Save to Database
        const notification = new Notification({
            recipient,
            type,
            title,
            message,
            relatedId
        });
        await notification.save();

        // 2. Emit via Socket.io (Real-time)
        // We assume the user joins a room with their User ID upon connection
        if (io) {
            io.to(recipient.toString()).emit('notification', notification);
        }

        // 3. Send Push Notification (Background)
        const user = await User.findById(recipient);
        if (user && user.pushSubscription && user.pushSubscription.endpoint) {
            const payload = JSON.stringify({
                title,
                body: message,
                url: process.env.CLIENT_URL || 'http://localhost:3000' // Adjust as needed
            });

            try {
                await webPush.sendNotification(user.pushSubscription, payload);
            } catch (error) {
                console.error('Error sending push notification:', error);
                // If 410 Gone, remove subscription? (Optional enhancement)
            }
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw, just log. Notification failure shouldn't break the main flow.
    }
};

module.exports = createNotification;
