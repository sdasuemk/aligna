const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

const router = express.Router();

// Get provider's clients
router.get('/clients', auth, async (req, res) => {
    try {
        if (req.user.role !== 'PROVIDER') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Find all services by this provider
        const services = await Service.find({ providerId: req.user.id });
        const serviceIds = services.map(s => s._id);

        // Find all appointments for these services
        const appointments = await Appointment.find({ serviceId: { $in: serviceIds } })
            .populate('clientId', '-password')
            .populate('serviceId')
            .sort({ startTime: -1 });

        const clientsMap = new Map();

        appointments.forEach(apt => {
            if (!apt.clientId) return;

            const client = apt.clientId;
            const clientId = client._id.toString();

            if (!clientsMap.has(clientId)) {
                clientsMap.set(clientId, {
                    _id: clientId,
                    name: client.profile?.name || 'Unknown',
                    email: client.email,
                    phone: client.profile?.phone,
                    totalVisits: 0,
                    totalRevenue: 0,
                    lastVisit: null,
                    bookings: []
                });
            }

            const clientStats = clientsMap.get(clientId);
            clientStats.totalVisits++;

            // Revenue
            if (apt.serviceId?.price) {
                clientStats.totalRevenue += apt.serviceId.price;
            }

            // Last Visit
            const aptDate = new Date(apt.startTime);
            if (!clientStats.lastVisit || aptDate > new Date(clientStats.lastVisit)) {
                clientStats.lastVisit = apt.startTime;
            }

            // Add booking to history
            clientStats.bookings.push({
                _id: apt._id,
                service: apt.serviceId?.name,
                date: apt.startTime,
                status: apt.status,
                price: apt.serviceId?.price
            });
        });

        res.json(Array.from(clientsMap.values()));

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const {
            type, // Account type
            name, phone, address, bio, website, // Shared
            dob, gender, emergencyContact, // Individual
            companyName, taxId, foundedDate, size // Organization
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update Account Type
        if (type) user.type = type;

        // Update Shared Fields
        if (name) user.profile.name = name;
        if (phone) user.profile.phone = phone;
        if (address) user.profile.address = address;
        if (bio) user.profile.bio = bio;
        if (website) user.profile.website = website;

        // Update Individual Fields
        if (dob) user.profile.dob = dob;
        if (gender) user.profile.gender = gender;
        if (emergencyContact) {
            user.profile.emergencyContact = {
                ...user.profile.emergencyContact,
                ...emergencyContact
            };
        }

        // Update Organization Fields
        if (companyName) user.profile.companyName = companyName;
        if (taxId) user.profile.taxId = taxId;
        if (foundedDate) user.profile.foundedDate = foundedDate;
        if (size) user.profile.size = size;

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

// --- Employee Management Routes ---

// Get all employees for the organization
router.get('/employees', auth, async (req, res) => {
    try {
        // Ensure user is an organization or part of one
        const orgId = req.user.organizationId || req.user.id;

        const employees = await User.find({
            $or: [
                { _id: orgId }, // Include the owner/org itself
                { organizationId: orgId }
            ]
        }).select('-password');

        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a new employee
router.post('/employees', auth, async (req, res) => {
    try {
        const { name, email, password, phone, role, employeeRole } = req.body;

        // Only OWNER or ADMIN can add employees
        // (Assuming req.user is populated with role/employeeRole)
        // For simplicity, allowing any PROVIDER for now, but in real app check permissions

        const orgId = req.user.organizationId || req.user.id;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            email,
            password: hashedPassword,
            role: 'PROVIDER', // Employees are providers
            type: 'INDIVIDUAL', // Employees are individuals
            organizationId: orgId,
            employeeRole: employeeRole || 'STAFF',
            profile: {
                name,
                phone
            }
        });

        res.status(201).json({
            id: user._id,
            email: user.email,
            profile: user.profile,
            employeeRole: user.employeeRole
        });

    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update employee
router.put('/employees/:id', auth, async (req, res) => {
    try {
        const { name, phone, employeeRole } = req.body;

        // Verify ownership/permission (skip for now)

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Employee not found' });

        if (name) user.profile.name = name;
        if (phone) user.profile.phone = phone;
        if (employeeRole) user.employeeRole = employeeRole;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove employee
router.delete('/employees/:id', auth, async (req, res) => {
    try {
        // Verify ownership/permission
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee removed' });
    } catch (error) {
        console.error('Error removing employee:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
