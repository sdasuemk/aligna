const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const webPush = require('web-push');

// Load env from server/.env if running from root, or .env if running from server/
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

// Connect to MongoDB
connectDB();

// Configure Web Push
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

if (publicVapidKey && privateVapidKey) {
    webPush.setVapidDetails(
        'mailto:test@test.com',
        publicVapidKey,
        privateVapidKey
    );
}

// Initialize WhatsApp Service
const { initializeWhatsApp } = require('./services/whatsappService');
initializeWhatsApp();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now, restrict in production
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

io.on('connection', (socket) => {
    console.log(`[SOCKET] New client connected: ${socket.id}`);

    // Join user to their own room for private notifications
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`[SOCKET] User ${userId} joined room ${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Make io accessible to our router
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/delivery-types', require('./routes/deliveryTypes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
