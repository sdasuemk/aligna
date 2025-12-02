const { sendEmailOtp } = require('../services/emailService');
const { sendWhatsAppOtp } = require('../services/whatsappService');
const { sendSmsOtp } = require('../services/smsService');

const sendOtp = async (identifier, otp, channel) => {
    console.log(`Sending OTP ${otp} via ${channel} to ${identifier}`);

    switch (channel) {
        case 'EMAIL':
            return await sendEmailOtp(identifier, otp);
        case 'WHATSAPP':
            return await sendWhatsAppOtp(identifier, otp);
        case 'SMS':
            return await sendSmsOtp(identifier, otp);
        default:
            throw new Error(`Unsupported channel: ${channel}`);
    }
};

module.exports = sendOtp;
