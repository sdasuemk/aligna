const mongoose = require('mongoose');
const Category = require('./server/models/Category');
require('dotenv').config({ path: './server/.env' });

const categories = [
    { name: 'Healthcare', description: 'Medical and health services', icon: '🏥', order: 1 },
    { name: 'Therapy & Counseling', description: 'Mental health and counseling services', icon: '🧠', order: 2 },
    { name: 'Fitness & Wellness', description: 'Physical fitness and wellness programs', icon: '💪', order: 3 },
    { name: 'Education & Tutoring', description: 'Educational and tutoring services', icon: '📚', order: 4 },
    { name: 'Beauty & Spa', description: 'Beauty treatments and spa services', icon: '💅', order: 5 },
    { name: 'Consulting', description: 'Professional consulting services', icon: '💼', order: 6 },
    { name: 'Legal Services', description: 'Legal consultation and services', icon: '⚖️', order: 7 },
    { name: 'Home Services', description: 'Cleaning, repair, and maintenance', icon: '🏠', order: 8 },
    { name: 'Pet Care', description: 'Veterinary and pet grooming services', icon: '🐾', order: 9 },
    { name: 'Automotive', description: 'Car repair and maintenance', icon: '🚗', order: 10 },
    { name: 'Events & Entertainment', description: 'Event planning and entertainment', icon: '🎉', order: 11 },
    { name: 'Financial Services', description: 'Accounting and financial planning', icon: '💰', order: 12 },
    { name: 'Technology & IT', description: 'Tech support and development', icon: '💻', order: 13 },
    { name: 'Creative & Design', description: 'Graphic design, photography, and art', icon: '🎨', order: 14 },
    { name: 'Real Estate', description: 'Property buying, selling, and leasing', icon: '🏘️', order: 15 },
    { name: 'Transportation', description: 'Taxi, moving, and logistics', icon: '🚚', order: 16 },
    { name: 'Food & Dining', description: 'Catering and personal chef services', icon: '🍽️', order: 17 },
    { name: 'Travel & Tourism', description: 'Travel planning and guide services', icon: '✈️', order: 18 },
    { name: 'Sports & Recreation', description: 'Coaching and recreational activities', icon: '⚽', order: 19 },
    { name: 'Other', description: 'Other professional services', icon: '📁', order: 20 }
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Insert new categories
        const result = await Category.insertMany(categories);
        console.log(`✅ Seeded ${result.length} categories successfully!`);

        console.log('\nCategories:');
        result.forEach(cat => {
            console.log(`  ${cat.icon} ${cat.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
