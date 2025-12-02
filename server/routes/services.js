const express = require('express');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all services (public or filtered by provider)
router.get('/', async (req, res) => {
    try {
        const { providerId } = req.query;
        const filter = providerId ? { providerId } : {};
        const services = await Service.find(filter).populate('providerId', 'email profile');
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Get single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('providerId', 'email profile');
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// Test endpoint
router.get('/test-logging', (req, res) => {
    console.log('TEST ENDPOINT HIT - LOGGING WORKS!');
    res.json({ message: 'Logging works!', timestamp: new Date().toISOString() });
});

// Get available slots for a specific date
router.get('/:id/slots', async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query; // YYYY-MM-DD

        console.log('='.repeat(60));
        console.log(`[SLOTS] REQUEST RECEIVED`);
        console.log(`[SLOTS] Service ID: ${id}`);
        console.log(`[SLOTS] Date: ${date}`);
        console.log('='.repeat(60));

        if (!date) return res.status(400).json({ error: 'Date is required' });

        const service = await Service.findById(id);
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // 1. Determine Day of Week (parse as local date to avoid timezone issues)
        const [year, month, day] = date.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day); // month is 0-indexed
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayOfWeek = days[targetDate.getDay()];

        console.log(`[SLOTS] Date: ${date}, Day of week: ${dayOfWeek}, getDay(): ${targetDate.getDay()}`);

        // 2. Get Availability Rules (convert Mongoose Map to plain object)
        const availability = service.availability ? Object.fromEntries(service.availability) : {};
        const dayRules = availability[dayOfWeek] || []; // e.g., ["09:00-17:00"]

        console.log(`[SLOTS] Availability for ${dayOfWeek}:`, dayRules);

        if (dayRules.length === 0) {
            console.log(`[SLOTS] No availability for ${dayOfWeek}`);
            return res.json([]); // No availability for this day
        }

        // 3. Fetch Existing Appointments for this Date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            serviceId: id,
            startTime: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            status: { $ne: 'CANCELLED' },
        });

        // 4. Generate Time Slots
        const slots = [];
        console.log(`[SLOTS] Generating slots from ${dayRules.length} rules...`);

        for (const rule of dayRules) {
            console.log(`[SLOTS] Processing rule: ${rule}`);
            const [startTime, endTime] = rule.split('-');
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            console.log(`[SLOTS] Start: ${startHour}:${startMin}, End: ${endHour}:${endMin}, Duration: ${service.duration} min`);

            let currentHour = startHour;
            let currentMin = startMin;

            while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                const slotTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

                // Count how many appointments exist for this slot
                const bookingCount = appointments.filter(apt => {
                    const aptTime = new Date(apt.startTime);
                    return aptTime.getHours() === currentHour && aptTime.getMinutes() === currentMin;
                }).length;

                // Slot is available only if bookingCount < maxCapacity
                const isAvailable = bookingCount < (service.maxCapacity || 1);

                console.log(`[SLOTS] Generated slot: ${slotTime}, bookings: ${bookingCount}/${service.maxCapacity}, available: ${isAvailable}`);

                slots.push({
                    time: slotTime,
                    available: isAvailable
                });

                // Increment by service duration
                currentMin += service.duration;
                if (currentMin >= 60) {
                    currentHour += Math.floor(currentMin / 60);
                    currentMin = currentMin % 60;
                }
            }
        }



        // Filter out duplicate slots based on time
        const uniqueSlots = slots.filter((slot, index, self) =>
            index === self.findIndex((t) => (
                t.time === slot.time
            ))
        );

        console.log(`[SLOTS] Total slots generated: ${uniqueSlots.length} (after removing duplicates)`);
        res.json(uniqueSlots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch slots' });
    }
});

// Create service
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, category, subcategory, deliveryType, duration, price, currency, maxCapacity, availability } = req.body;

        console.log('Creating service with data:', { name, category, subcategory, deliveryType, duration, price, maxCapacity, availability });

        const service = new Service({
            providerId: req.user.id,
            name,
            description,
            category,
            subcategory,
            deliveryType,
            duration,
            price,
            currency,
            maxCapacity,
            availability
        });

        await service.save();
        console.log('Service created successfully:', service._id);
        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to create service', details: error.message });
    }
});

// Update service
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, category, subcategory, deliveryType, duration, price, currency, maxCapacity, availability } = req.body;

        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // Check ownership
        if (service.providerId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update fields
        if (name) service.name = name;
        if (description !== undefined) service.description = description;
        if (category) service.category = category;
        if (subcategory !== undefined) service.subcategory = subcategory;
        if (deliveryType !== undefined) service.deliveryType = deliveryType;
        if (duration) service.duration = duration;
        if (price !== undefined) service.price = price;
        if (currency) service.currency = currency;
        if (maxCapacity) service.maxCapacity = maxCapacity;
        if (availability) service.availability = availability;

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// Delete service
router.delete('/:id', auth, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // Check ownership
        if (service.providerId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

module.exports = router;
