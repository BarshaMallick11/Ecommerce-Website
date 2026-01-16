// backend/routes/payment.js
const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order.model');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
    const { items } = req.body;
    const calculateOrderAmount = (items) => {
        let total = 0;
        items.forEach(item => {
            const discount = item.discount || 0;
            const discountedPrice = item.price * (1 - discount / 100);
            total += discountedPrice * item.quantity;
        });
        return Math.round(total * 100);
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

            // Import Product model for stock validation
            const Product = require('../models/product.model');

            // Validate stock availability for all items
            for (const item of cartItems) {
                const product = await Product.findById(item._id);
                if (!product) {
                    return res.status(400).json({
                        status: 'failure',
                        message: `Product ${item.name} not found.`
                    });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        status: 'failure',
                        message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.`
                    });
                }
            }

            // Deduct stock for all items atomically
            for (const item of cartItems) {
                await Product.findByIdAndUpdate(
                    item._id,
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
            }

            const newOrder = new Order({
                user: userId,
                products: cartItems.map(item => ({ product: item, quantity: item.quantity })),
                totalAmount: totalAmount,
                paymentId: razorpay_payment_id,
                shippingAddress: shippingAddress,
                paymentMethod: 'Razorpay'
            });

            await newOrder.save();
            res.json({ status: 'success', orderId: newOrder._id });
        } catch (error) {
            console.error('Order creation error:', error);
            res.status(500).json({ status: 'failure', message: 'Could not save order.' });
        }
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature.' });
    }
});

// @desc   Place a Cash on Delivery order
// @route  POST /api/payment/cod-order
// @access Private
router.post('/cod-order', protect, async (req, res) => {
    const { cartItems, totalAmount, shippingAddress } = req.body;

    try {
        const Product = require('../models/product.model');

        // Validate stock availability for all items
        for (const item of cartItems) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(400).json({
                    status: 'failure',
                    message: `Product ${item.name} not found.`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    status: 'failure',
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.`
                });
            }
        }

        // Deduct stock for all items atomically
        for (const item of cartItems) {
            await Product.findByIdAndUpdate(
                item._id,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        }

        const newOrder = new Order({
            user: req.user._id,
            products: cartItems.map(item => ({ product: item, quantity: item.quantity })),
            totalAmount: totalAmount,
            paymentMethod: 'COD',
            shippingAddress: shippingAddress,
            paymentId: `COD-${Date.now()}`,
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ status: 'success', orderId: savedOrder._id });
    } catch (error) {
        console.error('COD order error:', error);
        res.status(500).json({ status: 'failure', message: 'Could not place order.' });
    }
});

// @desc   Place a UPI order (awaiting payment proof)
// @route  POST /api/payment/upi-order
// @access Private
router.post('/upi-order', protect, async (req, res) => {
    const { cartItems, totalAmount, shippingAddress } = req.body;

    try {
        const Product = require('../models/product.model');

        // Validate stock availability for all items
        for (const item of cartItems) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(400).json({
                    status: 'failure',
                    message: `Product ${item.name} not found.`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    status: 'failure',
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.`
                });
            }
        }

        // Deduct stock for all items atomically
        for (const item of cartItems) {
            await Product.findByIdAndUpdate(
                item._id,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        }

        const newOrder = new Order({
            user: req.user._id,
            products: cartItems.map(item => ({ product: item, quantity: item.quantity })),
            totalAmount: totalAmount,
            paymentMethod: 'UPI',
            shippingAddress: shippingAddress,
            paymentId: `UPI-PENDING-${Date.now()}`,
            status: 'Processing', // Will be activated after admin approves payment
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({
            status: 'success',
            orderId: savedOrder._id,
            message: 'Order created. Please submit payment proof to complete.'
        });
    } catch (error) {
        console.error('UPI Order Error:', error);
        res.status(500).json({ status: 'failure', message: 'Could not place order.' });
    }
});

module.exports = router;

