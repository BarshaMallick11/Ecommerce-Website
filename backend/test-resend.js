require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('🧪 Testing Resend Email Service...\n');
    console.log('API Key:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('From Email:', process.env.RESEND_FROM_EMAIL || 'NOT SET');
    console.log('');

    try {
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: 'riderflynn062@gmail.com',
            subject: 'Test Email from Resend',
            html: '<p>Congrats on sending your <strong>first email</strong> with Resend!</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('\nResend is working properly! 🎉');
    } catch (error) {
        console.error('❌ Error sending email:');
        console.error('Message:', error.message);
        if (error.statusCode) {
            console.error('Status Code:', error.statusCode);
        }
        if (error.name) {
            console.error('Error Type:', error.name);
        }
    }
}

testResend();
