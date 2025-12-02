require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Service = require('./server/models/Service');
const Category = require('./server/models/Category');
const DeliveryType = require('./server/models/DeliveryType');

const serviceTemplates = {
    'Health & Wellness': [
        { name: 'General Checkup', sub: 'Primary Care' },
        { name: 'Consultation', sub: 'Specialist' },
        { name: 'Therapy Session', sub: 'Mental Health' },
        { name: 'Wellness Coaching', sub: 'Lifestyle' },
        { name: 'Nutrition Planning', sub: 'Dietary' }
    ],
    'Beauty & Spa': [
        { name: 'Haircut & Style', sub: 'Hair' },
        { name: 'Manicure', sub: 'Nails' },
        { name: 'Pedicure', sub: 'Nails' },
        { name: 'Facial Treatment', sub: 'Skincare' },
        { name: 'Massage Therapy', sub: 'Bodywork' }
    ],
    'Home Services': [
        { name: 'House Cleaning', sub: 'Cleaning' },
        { name: 'Plumbing Repair', sub: 'Maintenance' },
        { name: 'Electrical Inspection', sub: 'Maintenance' },
        { name: 'Gardening', sub: 'Outdoor' },
        { name: 'Painting', sub: 'Renovation' }
    ],
    'Education': [
        { name: 'Math Tutoring', sub: 'Academic' },
        { name: 'Language Lesson', sub: 'Languages' },
        { name: 'Music Class', sub: 'Arts' },
        { name: 'Science Workshop', sub: 'Academic' },
        { name: 'Coding Bootcamp', sub: 'Technology' }
    ],
    'Business': [
        { name: 'Consulting', sub: 'Strategy' },
        { name: 'Financial Planning', sub: 'Finance' },
        { name: 'Marketing Strategy', sub: 'Marketing' },
        { name: 'Legal Advice', sub: 'Legal' },
        { name: 'IT Support', sub: 'Technology' }
    ]
};

async function seedServices() {
    try {
        console.log('🌱 Starting service seeding...\n');

        // Connect to MongoDB
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // Fetch Providers
        const providers = await User.find({ role: 'PROVIDER' });
        if (providers.length === 0) {
            console.log('⚠️ No providers found. Please run seed-test-users.js first.');
            return;
        }
        console.log(`Found ${providers.length} providers.`);

        // Fetch Categories and Delivery Types
        const categories = await Category.find({});
        const deliveryTypes = await DeliveryType.find({});

        if (categories.length === 0) {
            console.log('⚠️ No categories found. Please run seed-categories.js first.');
            // Fallback categories if none exist
        }

        // Clear existing services for these providers (optional, but good for clean slate)
        await Service.deleteMany({ providerId: { $in: providers.map(p => p._id) } });
        console.log('🧹 Cleared existing services for these providers.\n');

        for (const provider of providers) {
            console.log(`\nCreating services for ${provider.profile?.name || provider.email}...`);

            for (let i = 0; i < 5; i++) {
                // Pick random category
                const category = categories.length > 0
                    ? categories[Math.floor(Math.random() * categories.length)]
                    : { name: 'General' };

                // Pick random delivery type
                const deliveryType = deliveryTypes.length > 0
                    ? deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)]
                    : { name: 'In-Person' };

                // Generate Name and Subcategory
                let name = `Service ${i + 1}`;
                let subcategory = 'General';

                if (serviceTemplates[category.name]) {
                    const template = serviceTemplates[category.name][i % serviceTemplates[category.name].length];
                    name = template.name;
                    subcategory = template.sub;
                } else {
                    // Fallback random selection
                    const allTemplates = Object.values(serviceTemplates).flat();
                    const template = allTemplates[Math.floor(Math.random() * allTemplates.length)];
                    name = template.name;
                    subcategory = template.sub;
                }

                // Generate Price and Duration
                const price = Math.floor(Math.random() * 150) + 50; // 50 - 200
                const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)];

                const serviceData = {
                    providerId: provider._id,
                    name: name,
                    description: `Professional ${name} provided by ${provider.profile?.name || 'our expert'}. Includes comprehensive assessment and personalized care.`,
                    category: category.name,
                    subcategory: subcategory,
                    deliveryType: deliveryType.name,
                    duration: duration,
                    price: price,
                    currency: 'INR',
                    isActive: true,
                    availability: {
                        mon: ['09:00-10:00'],
                        tue: ['09:00-10:00'],
                        wed: ['09:00-10:00'],
                        thu: ['09:00-10:00'],
                        fri: ['09:00-10:00']
                    }
                };

                await Service.create(serviceData);
                console.log(`   ✅ Created: ${name} (${subcategory}) - $${price}, ${duration}m`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Services seeded successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error seeding services:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

seedServices();
