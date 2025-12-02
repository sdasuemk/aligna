const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Handle both { user: { id: ... } } and { userId: ... } payload formats
        req.user = decoded.user || decoded;

        // Normalize id/userId/_id to just id
        if (!req.user.id && req.user._id) req.user.id = req.user._id;
        if (!req.user.id && req.user.userId) req.user.id = req.user.userId;

        console.log('Auth middleware - User ID:', req.user.id);
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        res.status(401).json({ error: 'Token is not valid' });
    }
};
