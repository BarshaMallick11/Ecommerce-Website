// backend/routes/orders.js
const router = require('express').Router();
const Order = require('../models/order.model');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc   Track an order by ID
// @route  GET /api/orders/track/:id
// @access Public
router.get('/track/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.json({
                status: order.status,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
            });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating order.' });
    }
});

// @desc   Get all orders
// @route  GET /api/orders/all
// @access Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id username').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all orders.' });
    }
});

// @desc   Update order to delivered
// @route  PUT /api/orders/:id/deliver
// @access Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
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
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user orders.' });
    }
});

module.exports = router;
