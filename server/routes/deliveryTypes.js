const express = require('express');
const router = express.Router();
const DeliveryType = require('../models/DeliveryType');
const auth = require('../middleware/auth');

// @route   GET api/delivery-types
// @desc    Get all delivery types
// @access  Public
router.get('/', async (req, res) => {
    try {
        const deliveryTypes = await DeliveryType.find({ isActive: true }).sort({ name: 1 });
        res.json(deliveryTypes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
