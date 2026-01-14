require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing email connection...');
    console.log('User:', process.env.EMAIL_USER);
    // Masking password for security in logs
    console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'NOT FOUND');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('SUCCESS: Connection established to Gmail SMTP.');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for test
            subject: 'SMTP Connection Test',
            text: 'This is a test email to verify SMTP configuration.'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('SUCCESS: Test email sent!', info.messageId);
    } catch (error) {
        console.error('FAILURE: SMTP test failed.');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);

        if (error.code === 'EAUTH') {
            console.log('\n--- TROUBLESHOOTING ---');
            console.log('1. Ensure you are using a Google "App Password" (16 characters).');
            console.log('2. Regular Google passwords do NOT work for SMTP unless you enable 2FA and create an App Password.');
            console.log('3. Visit: https://myaccount.google.com/apppasswords');
        }
    }
};

testEmail();
