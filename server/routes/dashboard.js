const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } = require('date-fns');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (TODO: Add auth middleware)
router.get('/stats', async (req, res) => {
    try {
        const { providerId } = req.query;

        if (!providerId) {
            return res.status(400).json({ message: 'Provider ID is required' });
        }

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const yesterdayStart = startOfDay(subDays(now, 1));
        const yesterdayEnd = endOfDay(subDays(now, 1));
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start

        // Fetch all appointments for the provider (via services)
        // First find all services belonging to this provider
        const services = await Service.find({ providerId });
        const serviceIds = services.map(s => s._id);

        // 1. Today's Appointments
        const todayAppointments = await Appointment.countDocuments({
            serviceId: { $in: serviceIds },
            startTime: { $gte: todayStart, $lte: todayEnd },
            status: { $ne: 'CANCELLED' }
        });

        // 2. Yesterday's Appointments
        const yesterdayAppointments = await Appointment.countDocuments({
            serviceId: { $in: serviceIds },
            startTime: { $gte: yesterdayStart, $lte: yesterdayEnd },
            status: { $ne: 'CANCELLED' }
        });

        // 3. Calculate Growth
        let appointmentGrowth = 0;
        if (yesterdayAppointments === 0) {
            appointmentGrowth = todayAppointments > 0 ? 100 : 0;
        } else {
            appointmentGrowth = ((todayAppointments - yesterdayAppointments) / yesterdayAppointments) * 100;
        }

        // Format growth string
        const growthSign = appointmentGrowth >= 0 ? '+' : '';
        const growthString = `${growthSign}${appointmentGrowth.toFixed(0)}% from yesterday`;

        // 4. Pending Appointments
        const pendingAppointments = await Appointment.countDocuments({
            serviceId: { $in: serviceIds },
            status: 'PENDING'
        });

        // 5. Total Services
        const totalServices = services.length;

        // 6. Weekly Revenue
        const weekAppointments = await Appointment.find({
            serviceId: { $in: serviceIds },
            startTime: { $gte: weekStart },
            status: 'COMPLETED'
        }).populate('serviceId');

        const weekRevenue = weekAppointments.reduce((sum, apt) => {
            return sum + (apt.serviceId?.price || 0);
        }, 0);

        // 7. Upcoming Appointments Count (Next 7 Days)
        const nextWeekEnd = new Date(now);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

        const upcomingAppointmentsCount = await Appointment.countDocuments({
            serviceId: { $in: serviceIds },
            startTime: { $gt: now, $lte: nextWeekEnd },
            status: { $ne: 'CANCELLED' }
        });

        // 8. New Services Count (Last 30 Days)
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newServicesCount = await Service.countDocuments({
            providerId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            todayAppointments,
            appointmentGrowth: growthString,
            pendingAppointments,
            totalServices,
            weekRevenue,
            upcomingAppointmentsCount,
            newServicesCount,
            recentActivities: await Appointment.find({
                serviceId: { $in: serviceIds }
            })
                .sort({ updatedAt: -1 })
                .limit(5)
                .populate('serviceId')
                .populate('clientId', 'profile.name')
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
