require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function checkDatabase() {
    try {
        console.log('🔍 Connecting to MongoDB...\n');
        console.log('Database URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));

        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected successfully!\n');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📦 Collections in database:');
        collections.forEach(col => console.log(`   - ${col.name}`));
        console.log('');

        // Count documents in each collection
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`📊 ${col.name}: ${count} document(s)`);

            if (count > 0 && count <= 5) {
                const docs = await mongoose.connection.db.collection(col.name).find({}).limit(5).toArray();
                console.log(`   Sample data:`);
                docs.forEach((doc, i) => {
                    console.log(`   ${i + 1}. ID: ${doc._id}`);
                    if (doc.email) console.log(`      Email: ${doc.email}`);
                    if (doc.name) console.log(`      Name: ${doc.name}`);
                    if (doc.role) console.log(`      Role: ${doc.role}`);
                    if (doc.status) console.log(`      Status: ${doc.status}`);
                });
            }
            console.log('');
        }

        console.log('✅ Database check complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();
