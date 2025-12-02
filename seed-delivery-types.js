const mongoose = require('mongoose');
const DeliveryType = require('./server/models/DeliveryType');
require('dotenv').config({ path: './server/.env' });

const deliveryTypes = [
    { name: 'In Office', description: 'Client visits the provider location' },
    { name: 'Onsite', description: 'Provider visits the client location' },
    { name: 'Virtual', description: 'Service provided via video/audio call' },
    { name: 'Home Delivery', description: 'Product or service delivered to client home' },
    { name: 'Curbside Pickup', description: 'Client picks up from provider location (curbside)' },
    { name: 'In Store', description: 'Service provided within a retail store' },
    { name: 'Outdoor', description: 'Service provided in an outdoor setting' },
    { name: 'Mobile Unit', description: 'Service provided via a mobile unit (e.g., food truck, mobile clinic)' },
    { name: 'Third Party Location', description: 'Service provided at a neutral third-party location' },
    { name: 'Mail Order', description: 'Service/Product handled via mail' }
];

const seedDeliveryTypes = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB Connected...');

        // Clear existing
        await DeliveryType.deleteMany({});
        console.log('Cleared existing delivery types');

        // Insert new
        await DeliveryType.insertMany(deliveryTypes);
        console.log('Delivery types seeded successfully');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDeliveryTypes();
