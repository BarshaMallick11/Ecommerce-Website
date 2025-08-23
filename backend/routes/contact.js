// backend/routes/contact.js
const router = require('express').Router();

router.post('/send', (req, res) => {
    const { name, email, message } = req.body;

    // In a real-world application, you would use a service like Nodemailer 
    // to send an email to the business owner.
    // For this guide, we will just log the submission to the console.
    console.log('--- New Contact Form Submission ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('---------------------------------');

    res.status(200).json({ message: 'Message received! We will get back to you soon.' });
});

module.exports = router;