// backend/routes/orders.js
const router = require('express').Router();
const Order = require('../models/order.model');
const { protect, admin } = require('../middleware/authMiddleware');

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
