const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;
let isReady = false;

const initializeWhatsApp = () => {
    console.log('Initializing WhatsApp Client...');

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('QR RECEIVED. Scan with WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        isReady = true;
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
