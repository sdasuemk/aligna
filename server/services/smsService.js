const axios = require('axios');

const sendSmsOtp = async (phone, otp) => {
    // Try Fast2SMS first (Free Tier)
    if (process.env.FAST2SMS_API_KEY) {
        try {
            console.log('Attempting to send SMS via Fast2SMS...');
            const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY
                },
                params: {
                    variables_values: otp,
                    route: 'otp',
                    numbers: phone.replace('+', '') // Fast2SMS expects numbers without +
                }
            });

            if (response.data.return) {
                console.log('Fast2SMS Success:', response.data);
                return true;
            } else {
                console.warn('Fast2SMS Failed:', response.data);
                // Fallthrough to next provider
            }
        } catch (error) {
            console.error('Fast2SMS Error:', error.message);
            // Fallthrough to next provider
        }
    }

    // Fallback to SMSIndiaHub (Paid)
    if (process.env.SMS_INDIA_HUB_API_KEY && process.env.SMS_INDIA_HUB_SENDER_ID) {
        try {
            console.log('Attempting to send SMS via SMSIndiaHub...');
            const response = await axios.get('http://cloud.smsindiahub.in/api/mt/SendSMS', {
                params: {
                    APIKey: process.env.SMS_INDIA_HUB_API_KEY,
                    senderid: process.env.SMS_INDIA_HUB_SENDER_ID,
                    channel: '2',
                    DCS: '0',
                    flashsms: '0',
                    number: phone.replace('+', ''), // Check format requirements
                    text: `Your verification code is ${otp}.`,
                    route: '1'
                }
            });

            if (response.data.ErrorCode === '000') {
                console.log('SMSIndiaHub Success:', response.data);
                return true;
            } else {
                console.error('SMSIndiaHub Failed:', response.data);
                throw new Error('SMS sending failed via all providers');
            }
        } catch (error) {
            console.error('SMSIndiaHub Error:', error.message);
            throw error;
        }
    }

    // If no keys configured or all failed
    console.log('[MOCK] SMS Configuration missing or failed. Mocking SMS send.');
    console.log(`[MOCK] Sending SMS OTP ${otp} to ${phone}`);
    return true;
};

module.exports = { sendSmsOtp };
