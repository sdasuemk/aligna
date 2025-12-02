const mongoose = require('mongoose');
const Category = require('./server/models/Category');
const DeliveryType = require('./server/models/DeliveryType');
require('dotenv').config({ path: './server/.env' });

async function verifySeedData() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB');

        const categoryCount = await Category.countDocuments();
        const deliveryTypeCount = await DeliveryType.countDocuments();

        console.log(`📊 Categories: ${categoryCount}`);
        console.log(`📊 Delivery Types: ${deliveryTypeCount}`);

        if (categoryCount === 20 && deliveryTypeCount === 10) {
            console.log('✅ Verification SUCCESS: Counts match expected values.');
        } else {
            console.error('❌ Verification FAILED: Counts do not match expected values.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifySeedData();
