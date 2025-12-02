const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    // Shared fields
    name: { type: String, required: true }, // Display Name or Contact Person
    bio: String,
    phone: String,
    address: String,
    website: String,

    // Individual specific
    dob: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },

    // Organization specific
    companyName: String,
    taxId: String,
    foundedDate: Date,
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '200+']
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordOtp: String,
    resetPasswordExpires: Date,
    role: {
        type: String,
        enum: ['CLIENT', 'PROVIDER'],
        default: 'CLIENT'
    },
    type: {
        type: String,
        enum: ['INDIVIDUAL', 'ORGANIZATION'],
        default: 'INDIVIDUAL'
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    employeeRole: {
        type: String,
        enum: ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'],
        default: 'OWNER'
    },
    preferredChannel: {
        type: String,
        enum: ['EMAIL', 'SMS', 'WHATSAPP'],
        default: 'EMAIL'
    },
    profile: {
        type: profileSchema,
        default: () => ({})
    },
    pushSubscription: {
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
