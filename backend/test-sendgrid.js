require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
    console.log('🧪 Testing SendGrid Email Service...\n');
    console.log('API Key:', process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('From Email:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');
    console.log('');

    if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY is not set in .env file');
        console.log('\n📝 Please:');
        console.log('1. Go to https://signup.sendgrid.com/');
        console.log('2. Create a free account');
        console.log('3. Go to Settings → API Keys');
        console.log('4. Create API Key with Full Access');
        console.log('5. Add to .env file as SENDGRID_API_KEY=SG.xxx...');
        return;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    try {
        const msg = {
            to: 'riderflynn062@gmail.com', // Test recipient
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Test Email from SendGrid',
            html: '<p>Congrats! Your <strong>SendGrid integration</strong> is working perfectly!</p><p>You can now send emails to ANY address without domain verification. 🎉</p>'
        };

        await sgMail.send(msg);

        console.log('✅ Email sent successfully!');
        console.log('Sent to:', msg.to);
        console.log('\nSendGrid is working properly! 🎉');
        console.log('\n💡 Note: Unlike Resend, SendGrid can send to ANY email address!');
    } catch (error) {
        console.error('❌ Error sending email:');
        console.error('Message:', error.message);

        if (error.response) {
            console.error('Status Code:', error.response.statusCode);
            console.error('Body:', JSON.stringify(error.response.body, null, 2));
        }

        if (error.code === 403) {
            console.log('\n💡 Tip: Make sure your SendGrid API key has "Full Access" permissions.');
        }
    }
}

testSendGrid();
