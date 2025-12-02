const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

let client;
let isReady = false;

const initializeWhatsApp = () => {
    console.log('Initializing WhatsApp Client...');

    const store = new MongoStore({ mongoose: mongoose });

    client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        }
    });

    client.on('qr', async (qr) => {
        console.log('QR RECEIVED. Scan with WhatsApp:');
        qrcode.generate(qr, { small: true });

        // Pairing Code Logic
        const pairingNumber = process.env.WHATSAPP_PAIRING_NUMBER;
        if (pairingNumber) {
            console.log(`Requesting pairing code for ${pairingNumber}...`);
            try {
                const code = await client.requestPairingCode(pairingNumber);
                console.log('--------------------------------------------------');
                console.log('WHATSAPP PAIRING CODE:', code);
                console.log('--------------------------------------------------');
            } catch (err) {
                console.error('Failed to request pairing code:', err);
            }
        }
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        isReady = true;
    });

    client.on('remote_session_saved', () => {
        console.log('WhatsApp Session Saved to DB');
    });

    client.on('authenticated', () => {
        console.log('WhatsApp Authenticated');
    });

    client.on('auth_failure', msg => {
        console.error('WhatsApp Authentication failure', msg);
    });

    client.initialize();
};

const sendWhatsAppOtp = async (phone, otp) => {
    if (!isReady) {
        console.warn('WhatsApp client not ready. OTP not sent.');
        throw new Error('WhatsApp client not ready');
    }

    try {
        // Format phone number
        // 1. Remove all non-digit characters
        let cleanPhone = phone.replace(/\D/g, '');

        // 2. If length is 10, assume Indian number and prepend '91'
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }

        // 3. Append suffix
        const formattedPhone = cleanPhone + '@c.us';

        const message = `Your verification code is: *${otp}*\n\nThis code expires in 10 minutes.`;

        await client.sendMessage(formattedPhone, message);
        console.log(`WhatsApp OTP sent to ${phone}`);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

module.exports = { initializeWhatsApp, sendWhatsAppOtp };
