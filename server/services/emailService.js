const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email Service Connection Error:', error);
    } else {
        console.log('Email Service is ready to send messages');
    }
});

const sendEmailOtp = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Verification Code</h2>
                    <p>Please use the following code to verify your account:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmailOtp };
