const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendOtp = require('../utils/sendOtp');
const generateOtp = require('../utils/generateOtp');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, name, otp, phone, channel } = req.body;

        // Verify OTP
        const otpRecord = await Otp.findOne({ identifier: email, otp });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Delete OTP after successful verification
        await Otp.deleteOne({ _id: otpRecord._id });

        // Create user with profile
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'CLIENT',
            preferredChannel: channel || 'EMAIL',
            profile: {
                name: name || email.split('@')[0],
                phone: phone
            }
        });

        // Create JWT payload
        const payload = {
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            }
        };

        // Generate token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, channel } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Determine delivery channel and target
        const selectedChannel = channel || user.preferredChannel || 'EMAIL';
        let deliveryTarget = user.email;

        if (selectedChannel === 'SMS' || selectedChannel === 'WHATSAPP') {
            if (user.profile && user.profile.phone) {
                deliveryTarget = user.profile.phone;
            } else {
                console.warn(`User ${email} selected ${selectedChannel} but has no phone. Falling back to EMAIL.`);
                // Fallback to email if phone is missing
                // In a real app, you might force them to update profile or fail
                deliveryTarget = user.email;
            }
        }

        // Generate 6-digit OTP
        const otp = generateOtp();

        // Upsert OTP
        await Otp.findOneAndUpdate(
            { identifier: email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send OTP
        await sendOtp(deliveryTarget, otp, selectedChannel);

        res.json({
            message: `OTP sent to your ${selectedChannel.toLowerCase()}`,
            requireOtp: true,
            channel: selectedChannel
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Verify OTP
router.post('/login-verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Verify OTP
        const otpRecord = await Otp.findOne({ identifier: email, otp });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        // Create JWT payload
        const payload = {
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user._id.toString(),
                        email: user.email,
                        role: user.role,
                        profile: user.profile
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send Verification OTP (Registration)
router.post('/send-verification-otp', async (req, res) => {
    try {
        const { email, phone, channel } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = generateOtp();

        // Upsert OTP - Store against EMAIL so register endpoint can find it
        await Otp.findOneAndUpdate(
            { identifier: email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Determine delivery target
        const deliveryTarget = channel === 'EMAIL' ? email : phone;

        if (!deliveryTarget) {
            return res.status(400).json({ error: 'Delivery target (email or phone) is missing' });
        }

        // Send OTP via selected channel
        await sendOtp(deliveryTarget, otp, channel || 'EMAIL');

        res.json({ message: `OTP ${otp} sent successfully via ${channel || 'EMAIL'}` });
    } catch (error) {
        console.error('Send verification OTP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, channel } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = generateOtp();

        // Save OTP and expiration (10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send OTP via selected channel
        await sendOtp(email, otp, channel || 'EMAIL');

        res.json({ message: `OTP ${otp} sent successfully via ${channel || 'EMAIL'}` });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password - Verify OTP and Update Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
