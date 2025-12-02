const express = require('express');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const createNotification = require('../utils/notificationHelper');

const router = express.Router();

// Get appointments (Provider: all their services, Client: their bookings)
router.get('/', auth, async (req, res) => {
    try {
        const { role, id } = req.user;

        let appointments;
        if (role === 'PROVIDER') {
            // Get all services by this provider
            const services = await Service.find({ providerId: id });
            const serviceIds = services.map(s => s._id);

            appointments = await Appointment.find({ serviceId: { $in: serviceIds } })
                .populate('serviceId')
                .populate('clientId', 'profile email')
                .sort({ startTime: -1 });
        } else {
            appointments = await Appointment.find({ clientId: id })
                .populate({
                    path: 'serviceId',
                    populate: { path: 'providerId', select: 'profile email' }
                })
                .sort({ startTime: -1 });
        }

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Book appointment (Client only)
router.post('/', auth, async (req, res) => {
    try {
        const { serviceId, startTime, notes } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ error: 'Service not found' });

        const start = new Date(startTime);
        const end = new Date(start.getTime() + service.duration * 60000);

        // Check availability (respecting maxCapacity)
        const conflictCount = await Appointment.countDocuments({
            serviceId,
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } }
            ],
            status: { $ne: 'CANCELLED' }
        });

        if (conflictCount >= (service.maxCapacity || 1)) {
            return res.status(400).json({ error: 'Slot not available' });
        }

        const appointment = await Appointment.create({
            serviceId,
            clientId: req.user.id,
            startTime: start,
            endTime: end,
            status: 'PENDING',
            notes
        });

        // Populate details for the socket event
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('serviceId')
            .populate('clientId', 'profile email');

        // Emit event to all connected clients (in a real app, we'd target specific users)
        console.log('[SOCKET] Emitting appointment_created event');
        req.io.emit('appointment_created', populatedAppointment);

        // Notify Provider
        await createNotification(req.io, {
            recipient: service.providerId,
            type: 'APPOINTMENT_NEW',
            title: 'New Appointment',
            message: `New booking for ${service.name} on ${start.toLocaleString()}`,
            relatedId: appointment._id
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Booking failed' });
    }
});

// Update status (Provider can update any status, Client can only cancel)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findById(id).populate('serviceId');
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        // Check authorization
        const isProvider = appointment.serviceId.providerId.toString() === req.user.id;
        const isClient = appointment.clientId.toString() === req.user.id;

        if (!isProvider && !isClient) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Clients can only cancel their own appointments
        if (isClient && !isProvider && status !== 'CANCELLED') {
            return res.status(403).json({ error: 'Clients can only cancel appointments' });
        }

        appointment.status = status;
        await appointment.save();

        // Emit event
        req.io.emit('appointment_updated', appointment);

        // Notify relevant party
        if (isProvider) {
            // Provider updated status -> Notify Client
            let type = 'SYSTEM';
            let title = 'Appointment Update';
            let message = `Your appointment status is now ${status}`;

            if (status === 'CONFIRMED') {
                type = 'APPOINTMENT_CONFIRMED';
                title = 'Appointment Confirmed';
                message = `Your appointment for ${appointment.serviceId.name} has been confirmed.`;
            } else if (status === 'CANCELLED') {
                type = 'APPOINTMENT_CANCELLED';
                title = 'Appointment Cancelled';
                message = `Your appointment for ${appointment.serviceId.name} has been cancelled by the provider.`;
            } else if (status === 'COMPLETED') {
                type = 'APPOINTMENT_COMPLETED';
                title = 'Appointment Completed';
                message = `Your appointment for ${appointment.serviceId.name} has been marked as completed.`;
            }

            await createNotification(req.io, {
                recipient: appointment.clientId,
                type,
                title,
                message,
                relatedId: appointment._id
            });
        } else if (isClient && status === 'CANCELLED') {
            // Client cancelled -> Notify Provider
            await createNotification(req.io, {
                recipient: appointment.serviceId.providerId,
                type: 'APPOINTMENT_CANCELLED',
                title: 'Appointment Cancelled',
                message: `Client has cancelled the appointment for ${appointment.serviceId.name}.`,
                relatedId: appointment._id
            });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
