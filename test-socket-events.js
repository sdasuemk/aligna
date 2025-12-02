const io = require('socket.io-client');

const socket = io('http://localhost:5001');

console.log('Connecting to socket server...');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('appointment_created', (data) => {
    console.log('RECEIVED EVENT: appointment_created');
    console.log('Data:', JSON.stringify(data, null, 2));
});

socket.on('appointment_updated', (data) => {
    console.log('RECEIVED EVENT: appointment_updated');
    console.log('Data:', JSON.stringify(data, null, 2));
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Keep alive
setInterval(() => { }, 1000);
