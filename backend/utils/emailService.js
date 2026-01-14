const nodemailer = require('nodemailer');

const sendStatusUpdateEmail = async (order, user) => {
    console.log(`Attempting to send status update email for order #${order._id} to ${user.email}`);

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials missing in environment variables.');
            return false;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Status-specific messages
        const statusMessages = {
            'Processing': 'Your grocery order has been received and is being processed.',
            'Shipped': 'Your grocery order has been shipped. It will be delivered soon.',
            'Delivered': 'Your grocery order has been delivered. Thank you for shopping with us!',
            'Cancelled': 'Your grocery order has been cancelled. We apologize for the inconvenience.'
        };

        const statusColors = {
            'Processing': '#1890ff',
            'Shipped': '#52c41a',
            'Delivered': '#52c41a',
            'Cancelled': '#ff4d4f'
        };

        const message = statusMessages[order.status] || `Your order status has been updated to ${order.status}.`;
        const statusColor = statusColors[order.status] || '#1890ff';

        const mailOptions = {
            from: `"Premium Store" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Order Status Update: ${order.status} - Order #${order._id}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Status Update</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <div style="background-color: ${statusColor}; padding: 30px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Order Status Update</h1>
                            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Order #${order._id}</p>
                        </div>

                        <!-- Body -->
                        <div style="padding: 30px 20px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">Hello <strong>${user.username}</strong>,</p>

                            <p style="font-size: 16px; color: #555; margin: 0 0 20px 0;">${message}</p>

                            <!-- Order Details Box -->
                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #666; width: 40%;">New Status:</td>
                                        <td style="padding: 8px 0; color: ${statusColor}; font-weight: bold; font-size: 18px;">${order.status}</td>
                                    </tr>
                                    ${order.trackingNumber ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;">Tracking Number:</td>
                                        <td style="padding: 8px 0; color: #333;">${order.trackingNumber}</td>
                                    </tr>
                                    ` : ''}
                                    ${order.estimatedDeliveryDate ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;">Estimated Delivery:</td>
                                        <td style="padding: 8px 0; color: #333;">${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                                        <td style="padding: 8px 0; color: #333; font-weight: bold;">₹${order.totalAmount.toFixed(2)}</td>
                                    </tr>
                                </table>
                            </div>

                            ${order.status === 'Shipped' ? `
                            <div style="background-color: #e6f7ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #91d5ff;">
                                <p style="margin: 0; color: #0050b3; font-size: 14px;">
                                    <strong>Delivery Tip:</strong> Please ensure someone is available to receive your grocery order. Track your shipment using the tracking number provided.
                                </p>
                            </div>
                            ` : ''}

                            <p style="font-size: 14px; color: #666; margin: 20px 0;">You can view your complete order history by logging into your account.</p>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                            <p style="font-size: 14px; color: #333; margin: 0 0 5px 0;">Thank you for shopping with us!</p>
                            <p style="font-size: 16px; color: ${statusColor}; font-weight: bold; margin: 0;">Premium Store</p>
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                                <p style="font-size: 12px; color: #999; margin: 5px 0;">This is an automated message. Please do not reply.</p>
                                <p style="font-size: 12px; color: #999; margin: 5px 0;">&copy; ${new Date().getFullYear()} Premium Store. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Critical Error in Email Service:');
        console.error('- Message:', error.message);
        console.error('- Order ID:', order._id);
        console.error('- User Email:', user.email);
        console.error('- Status:', order.status);

        if (error.code === 'EAUTH') {
            console.error('- Authentication Error: Check EMAIL_USER and EMAIL_PASS in .env');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('- Timeout Error: Check internet connection');
        }
        return false;
    }
};

module.exports = { sendStatusUpdateEmail };