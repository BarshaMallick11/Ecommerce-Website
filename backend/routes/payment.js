// backend/routes/payment.js
const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order.model');
const jwt = require('jsonwebtoken');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
    const { items } = req.body;
    const calculateOrderAmount = (items) => {
        let total = 0;
        items.forEach(item => {
            total += item.price * item.quantity;
        });
        return Math.round(total * 100); // Amount in the smallest currency unit (paise)
    };

    const options = {
        amount: calculateOrderAmount(items),
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, totalAmount, token, shippingAddress } = req.body;
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            const newOrder = new Order({
                user: userId,
                products: cartItems.map(item => ({ product: item, quantity: item.quantity })),
                totalAmount: totalAmount,
                paymentId: razorpay_payment_id,
                shippingAddress: shippingAddress,
            });

            await newOrder.save();
            res.json({ status: 'success', orderId: newOrder._id });
        } catch (error) {
            res.status(500).json({ status: 'failure', message: 'Could not save order.' });
        }
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature.' });
    }
});

module.exports = router;
