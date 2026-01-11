// backend/routes/orders.js
const router = require('express').Router();
const Order = require('../models/order.model');
const UpiPayment = require('../models/upiPayment.model');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc   Get all orders
// @route  GET /api/orders/all
// @access Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        // Get all orders
        const allOrders = await Order.find({}).populate('user', 'id username').sort({ createdAt: -1 });

        // Filter out UPI orders that don't have approved payment
        const filteredOrders = [];

        for (const order of allOrders) {
            // If it's not a UPI order, include it
            if (order.paymentMethod !== 'UPI') {
                filteredOrders.push(order);
                continue;
            }

            // If it's a UPI order, check if payment is approved
            const payment = await UpiPayment.findOne({
                orderId: order._id,
                status: 'approved'
            });

            // Only include UPI orders with approved payments
            if (payment) {
                filteredOrders.push(order);
            }
        }

        res.json(filteredOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching all orders.' });
    }
});

// @desc   Update order status and tracking
// @route  PUT /api/orders/:id/status
// @access Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
            order.estimatedDeliveryDate = req.body.estimatedDeliveryDate || order.estimatedDeliveryDate;

            // --- LOGIC TO SET DATES ---
            if (req.body.status === 'Shipped' && !order.shippedAt) {
                order.shippedAt = Date.now();
            } else if (req.body.status === 'Delivered' && !order.deliveredAt) {
                order.deliveredAt = Date.now();
            } else if (req.body.status === 'Cancelled' && !order.cancelledAt) {
                order.cancelledAt = Date.now();
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating order.' });
    }
});

// @desc   Get logged in user orders
// @route  GET /api/orders
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        // For each UPI order, attach payment verification status
        const ordersWithPaymentStatus = await Promise.all(orders.map(async (order) => {
            const orderObj = order.toObject();

            if (order.paymentMethod === 'UPI') {
                const payment = await UpiPayment.findOne({ orderId: order._id });
                orderObj.upiPaymentStatus = payment ? payment.status : 'no_proof';
                orderObj.upiPaymentNote = payment ? payment.verificationNote : null;
            }

            return orderObj;
        }));

        res.json(ordersWithPaymentStatus);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders.' });
    }
});

// @desc   Delete an order
// @route  DELETE /api/orders/:id
// @access Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
