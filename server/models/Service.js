const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    deliveryType: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 15
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    maxCapacity: {
        type: Number,
        default: 1,
        min: 1
    },
    availability: {
        type: Map,
        of: [String],
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
