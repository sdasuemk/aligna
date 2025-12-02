// Direct diagnostic test of slots logic
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const Service = require('./server/models/Service');

mongoose.connect(process.env.DATABASE_URL);

async function testSlotsLogic() {
    try {
        const serviceId = '69266f3ecacc291af92c796b';
        const testDate = '2025-12-01';

        console.log('🔍 Testing Slots Generation Logic\n');
        console.log('Service ID:', serviceId);
        console.log('Test Date:', testDate);

        // Fetch service
        const service = await Service.findById(serviceId);
        if (!service) {
            console.log('❌ Service not found!');
            process.exit(1);
        }

        console.log('\n✅ Service found:', service.name);
        console.log('Duration:', service.duration);
        console.log('Max Capacity:', service.maxCapacity);
        console.log('\nAvailability:', JSON.stringify(service.availability, null, 2));

        // Determine day of week
        const [year, month, day] = testDate.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day);
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayOfWeek = days[targetDate.getDay()];

        console.log('\n📅 Date Analysis:');
        console.log('Parsed date:', targetDate.toDateString());
        console.log('getDay():', targetDate.getDay());
        console.log('Day of week:', dayOfWeek);

        // Get availability rules
        const availability = service.availability || {};
        const dayRules = availability[dayOfWeek] || [];

        console.log('\n⏰ Availability Check:');
        console.log(`Rules for ${dayOfWeek}:`, dayRules);

        if (dayRules.length === 0) {
            console.log(`❌ No availability for ${dayOfWeek}!`);
            process.exit(0);
        }

        // Generate slots
        console.log('\n🎰 Generating Slots:');
        const slots = [];

        for (const rule of dayRules) {
            console.log(`\nProcessing rule: ${rule}`);
            const [startTime, endTime] = rule.split('-');
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            console.log(`  Start: ${startHour}:${String(startMin).padStart(2, '0')}`);
            console.log(`  End: ${endHour}:${String(endMin).padStart(2, '0')}`);
            console.log(`  Duration: ${service.duration} minutes`);

            let currentHour = startHour;
            let currentMin = startMin;
            let slotCount = 0;

            while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                const slotTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
                slots.push({ time: slotTime, available: true });
                slotCount++;

                // Increment by duration
                currentMin += service.duration;
                if (currentMin >= 60) {
                    currentHour += Math.floor(currentMin / 60);
                    currentMin = currentMin % 60;
                }
            }

            console.log(`  Generated ${slotCount} slots from this rule`);
        }

        console.log(`\n✅ Total Slots Generated: ${slots.length}`);
        console.log('\nSlots:', slots.map(s => s.time).join(', '));

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testSlotsLogic();
