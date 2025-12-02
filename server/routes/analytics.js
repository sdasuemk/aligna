const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, subDays } = require('date-fns');

// @route   GET /api/analytics
// @desc    Get aggregated analytics data
// @access  Private (TODO: Add auth middleware)
router.get('/', async (req, res) => {
    try {
        const { timeRange } = req.query; // '1W', '1M', '1Y', etc.

        // 1. Calculate Date Ranges
        const endDate = new Date();
        let startDate = subDays(endDate, 7); // Default 1W
        let previousStartDate = subDays(startDate, 7);

        if (timeRange === '1M') {
            startDate = subMonths(endDate, 1);
            previousStartDate = subMonths(startDate, 1);
        } else if (timeRange === '1Y') {
            startDate = subMonths(endDate, 12);
            previousStartDate = subMonths(startDate, 12);
        } else if (timeRange === '3Y') {
            startDate = subMonths(endDate, 36);
            previousStartDate = subMonths(startDate, 36);
        } else if (timeRange === '5Y') {
            startDate = subMonths(endDate, 60);
            previousStartDate = subMonths(startDate, 60);
        } else if (timeRange === 'ALL') {
            startDate = new Date(0); // Beginning of time
            previousStartDate = new Date(0); // No previous period
        }

        // 2. Fetch Appointments for Current Period
        const appointments = await Appointment.find({
            startTime: { $gte: startDate, $lte: endDate }
        }).populate('serviceId');

        // 3. Fetch Appointments for Previous Period
        const previousAppointments = await Appointment.find({
            startTime: { $gte: previousStartDate, $lt: startDate }
        }).populate('serviceId');

        // Helper to calculate KPIs
        const calculateKPIs = (apts) => {
            const totalRevenue = apts.reduce((sum, apt) => sum + (apt.serviceId?.price || 0), 0);
            const totalBookings = apts.length;
            const uniqueClients = new Set(apts.map(apt => apt.clientId?.toString()));
            const newClients = uniqueClients.size;
            const occupancyRate = 85; // Mock for now
            return { totalRevenue, totalBookings, newClients, occupancyRate };
        };

        const currentKPIs = calculateKPIs(appointments);
        const previousKPIs = calculateKPIs(previousAppointments);

        // Helper to calculate percentage change
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const change = ((current - previous) / previous) * 100;
            return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
        };

        const kpiChanges = {
            revenueChange: calculateChange(currentKPIs.totalRevenue, previousKPIs.totalRevenue),
            bookingsChange: calculateChange(currentKPIs.totalBookings, previousKPIs.totalBookings),
            clientsChange: calculateChange(currentKPIs.newClients, previousKPIs.newClients),
            occupancyChange: calculateChange(currentKPIs.occupancyRate, previousKPIs.occupancyRate) // Mock comparison
        };

        // 4. Revenue Trend Data
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const revenueTrend = days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayRevenue = appointments
                .filter(apt => format(new Date(apt.startTime), 'yyyy-MM-dd') === dateStr)
                .reduce((sum, apt) => sum + (apt.serviceId?.price || 0), 0);
            return {
                name: format(day, 'EEE'), // Mon, Tue...
                fullDate: dateStr,
                revenue: dayRevenue
            };
        });

        // 5. Weekly Status (Bookings vs Cancelled)
        const weeklyStatus = days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayApts = appointments.filter(apt => format(new Date(apt.startTime), 'yyyy-MM-dd') === dateStr);
            return {
                name: format(day, 'EEE'),
                bookings: dayApts.filter(apt => apt.status !== 'CANCELLED').length,
                cancelled: dayApts.filter(apt => apt.status === 'CANCELLED').length
            };
        });

        // 6. Top Services
        const serviceCounts = {};
        appointments.forEach(apt => {
            if (apt.serviceId) {
                const name = apt.serviceId.name;
                serviceCounts[name] = (serviceCounts[name] || 0) + 1;
            }
        });

        const topServices = Object.entries(serviceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        res.json({
            kpi: {
                ...currentKPIs,
                ...kpiChanges
            },
            revenueTrend,
            weeklyStatus,
            topServices
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
