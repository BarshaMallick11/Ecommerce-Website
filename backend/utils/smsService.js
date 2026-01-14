const sendStatusUpdateSMS = async (order, user, phoneNumber) => {
    console.log(`Attempting to send status update SMS for order #${order._id} to ${phoneNumber}`);

    try {
        if (!process.env.FAST2SMS_API_KEY) {
            console.log('Fast2SMS API key not configured. SMS notification skipped.');
            return false;
        }

        // Status-specific SMS messages
        const statusMessages = {
            'Processing': `Your grocery order #${order._id} has been received and is being processed.`,
            'Shipped': `Your grocery order #${order._id} has been shipped. It will be delivered soon.`,
            'Delivered': `Your grocery order #${order._id} has been delivered. Thank you for shopping with us!`,
            'Cancelled': `Your grocery order #${order._id} has been cancelled. Contact support for more info.`
        };

        const message = statusMessages[order.status] || `Your order #${order._id} status updated to ${order.status}.`;

        // Fast2SMS API call
        const fetch = require('node-fetch');
        const url = 'https://www.fast2sms.com/dev/bulkV2';
        const options = {
            method: 'POST',
            headers: {
                'authorization': process.env.FAST2SMS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'q', // Quick SMS route
                message: message,
                language: 'english',
                flash: 0,
                numbers: phoneNumber
            })
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (data.return === true) {
            console.log(`SMS sent successfully to ${phoneNumber}. Message ID: ${data.request_id}`);
            return true;
        } else {
            console.error('Fast2SMS API Error:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Critical Error in SMS Service:');
        console.error('- Message:', error.message);
        console.error('- Order ID:', order._id);
        console.error('- Phone:', phoneNumber);
        return false;
    }
};

module.exports = { sendStatusUpdateSMS };
