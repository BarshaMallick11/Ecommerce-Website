// Quick test script for Render email connectivity
require('dotenv').config();
const nodemailer = require('nodemailer');

const testRenderEmail = async () => {
    console.log('🧪 Testing Email on Render...\n');
    console.log('User:', process.env.EMAIL_USER || 'NOT FOUND ❌');
    console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'NOT FOUND ❌');
    console.log('\n--- Testing Port 587 (STARTTLS) ---');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });

    try {
        console.log('⏳ Attempting connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!\n');

        console.log('⏳ Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: '✅ Render Email Test - SUCCESS',
            text: 'If you receive this, email is working on Render!',
            html: '<h1>✅ Success!</h1><p>Email is working on Render with port 587.</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('\n🎉 ALL TESTS PASSED - Emails will work on Render!');
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Error Code:', error.code);

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
            console.log('\n⚠️  TIMEOUT/CONNECTION ERROR');
            console.log('This is likely because:');
            console.log('1. Render is blocking Gmail SMTP (common issue)');
            console.log('2. Gmail is blocking Render\'s IP addresses');
            console.log('\n💡 SOLUTION: Switch to SendGrid, Mailgun, or Resend');
            console.log('   These services are designed for cloud platforms.');
        } else if (error.code === 'EAUTH') {
            console.log('\n⚠️  AUTHENTICATION ERROR');
            console.log('1. Make sure EMAIL_USER and EMAIL_PASS are set in Render');
            console.log('2. If using 2FA, you MUST use an App Password');
            console.log('3. Visit: https://myaccount.google.com/apppasswords');
        }
    }
};

console.log('=====================================');
console.log('    RENDER EMAIL TEST UTILITY');
console.log('=====================================\n');
testRenderEmail();
