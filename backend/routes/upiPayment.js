// backend/routes/upiPayment.js
const router = require('express').Router();
const UpiPayment = require('../models/upiPayment.model');
const Order = require('../models/order.model');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for payment screenshots
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'upi-payment-proofs',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc   Submit UPI payment proof
// @route  POST /api/upi-payment/submit
// @access Private
router.post('/submit', protect, (req, res, next) => {
    console.log('=== Upload middleware starting ===');
    upload.single('screenshot')(req, res, (err) => {
        if (err) {
            console.error('=== Multer/Cloudinary Upload Error ===');
            console.error('Error:', err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            return res.status(400).json({
                message: 'File upload failed',
                error: err.message
            });
        }
        console.log('Upload middleware completed successfully');
        next();
    });
}, async (req, res) => {
    try {
        console.log('=== UPI Payment Submission ===');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('File:', JSON.stringify(req.file, null, 2));
        console.log('User:', req.user._id);

        const { orderId, utr, amount, payeeName } = req.body;

        // Validate required fields (UTR is now optional)
        if (!orderId || !amount) {
            console.log('Missing fields:', { orderId: !!orderId, amount: !!amount });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if screenshot was uploaded
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'Payment screenshot is required' });
        }

        console.log('Screenshot uploaded:', req.file.path);

        // Check if order exists and belongs to user
        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order found:', order._id);

        // Check if order is already paid
        if (order.paymentMethod !== 'UPI' || order.status !== 'Processing') {
            console.log('Invalid order status:', { paymentMethod: order.paymentMethod, status: order.status });
            return res.status(400).json({ message: 'Invalid order status' });
        }

        // Check if payment proof already exists for this order
        const existingPayment = await UpiPayment.findOne({ orderId });
        if (existingPayment) {
            console.log('Payment proof already exists for order:', orderId);
            return res.status(400).json({ message: 'Payment proof already submitted for this order' });
        }

        // Check if UTR is already used (fraud protection) - only if UTR is provided
        const utrValue = (utr && utr.trim() && utr.trim().length > 0) ? utr.trim() : undefined;
        console.log('UTR value for validation:', utrValue);

        if (utrValue) {
            const duplicateUTR = await UpiPayment.findOne({ utr: utrValue });
            if (duplicateUTR) {
                console.log('Duplicate UTR found:', utrValue);
                return res.status(400).json({ message: 'This UTR has already been used' });
            }
        }

        // Check user's pending payment count (limit 3 per user)
        const pendingPayments = await UpiPayment.countDocuments({
            user: req.user._id,
            status: 'pending'
        });
        console.log('Pending payments count:', pendingPayments);
        if (pendingPayments >= 3) {
            return res.status(400).json({
                message: 'You have too many pending verifications. Please wait for admin approval.'
            });
        }

        // Verify amount matches order total
        const submittedAmount = parseFloat(amount);
        const orderTotal = parseFloat(order.totalAmount);

        console.log('Amount comparison raw:', { amount, order_total: order.totalAmount });
        console.log('Amount comparison parsed:', { submitted: submittedAmount, order: orderTotal });

        if (Math.abs(submittedAmount - orderTotal) > 0.01) {
            console.log('Amount mismatch failed:', { diff: Math.abs(submittedAmount - orderTotal) });
            return res.status(400).json({
                message: `Amount mismatch. Expected ₹${orderTotal.toFixed(2)}, received ₹${submittedAmount.toFixed(2)}`
            });
        }

        // Create payment proof record
        const paymentProof = new UpiPayment({
            user: req.user._id,
            orderId,
            ...(utrValue && { utr: utrValue }),
            amount: submittedAmount,
            paymentScreenshot: req.file.path,
            payeeName: payeeName || '',
            status: 'pending'
        });

        console.log('Saving payment proof...');
        await paymentProof.save();
        console.log('Payment proof saved:', paymentProof._id);

        res.status(201).json({
            status: 'success',
            message: 'Payment proof submitted successfully! Please wait for admin verification.',
            paymentId: paymentProof._id
        });
    } catch (error) {
        console.error('=== UPI Payment Submission Error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error code:', error.code);

        if (error.code === 11000) {
            if (error.keyPattern?.utr) {
                return res.status(400).json({
                message: 'Duplicate UTR number'
            });
        }

  return res.status(400).json({
    message: 'Duplicate payment record'
  });
}
        res.status(500).json({
            message: 'Failed to submit payment proof',
            error: error.message
        });
    }
});

// @desc   Get user's UPI payment submissions
// @route  GET /api/upi-payment/my-payments
// @access Private
router.get('/my-payments', protect, async (req, res) => {
    try {
        const payments = await UpiPayment.find({ user: req.user._id })
            .populate('orderId', 'totalAmount status createdAt')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
});

// @desc   Get all pending UPI payments (Admin)
// @route  GET /api/upi-payment/pending
// @access Private/Admin
router.get('/pending', protect, admin, async (req, res) => {
    try {
        const pendingPayments = await UpiPayment.find({ status: 'pending' })
            .populate('user', 'username email')
            .populate('orderId', 'totalAmount status createdAt')
            .sort({ createdAt: -1 });
        res.json(pendingPayments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending payments' });
    }
});

// @desc   Get all UPI payments (Admin)
// @route  GET /api/upi-payment/all
// @access Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const payments = await UpiPayment.find(query)
            .populate('user', 'username email')
            .populate('orderId', 'totalAmount status createdAt')
            .populate('verifiedBy', 'username')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
});

// @desc   Approve UPI payment (Admin)
// @route  PUT /api/upi-payment/:id/approve
// @access Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
    try {
        const { verificationNote } = req.body;

        const payment = await UpiPayment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        // Update payment status
        payment.status = 'approved';
        payment.verifiedBy = req.user._id;
        payment.verifiedAt = Date.now();
        payment.verificationNote = verificationNote || '';
        await payment.save();

        // Update the order payment status
        const order = await Order.findById(payment.orderId);
        if (order) {
            order.paymentId = payment.utr ? `UPI-${payment.utr}` : `UPI-${payment._id}`;
            await order.save();
        }

        res.json({
            status: 'success',
            message: 'Payment approved successfully',
            payment
        });
    } catch (error) {
        console.error('Approve Payment Error:', error);
        res.status(500).json({ message: 'Error approving payment' });
    }
});

// @desc   Reject UPI payment (Admin)
// @route  PUT /api/upi-payment/:id/reject
// @access Private/Admin
router.put('/:id/reject', protect, admin, async (req, res) => {
    try {
        const { verificationNote } = req.body;

        const payment = await UpiPayment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        // Update payment status
        payment.status = 'rejected';
        payment.verifiedBy = req.user._id;
        payment.verifiedAt = Date.now();
        payment.verificationNote = verificationNote || '';
        await payment.save();

        // Optionally cancel the order
        const order = await Order.findById(payment.orderId);
        if (order && order.status === 'Processing') {
            order.status = 'Cancelled';
            order.cancelledAt = Date.now();
            await order.save();
        }

        res.json({
            status: 'success',
            message: 'Payment rejected',
            payment
        });
    } catch (error) {
        console.error('Reject Payment Error:', error);
        res.status(500).json({ message: 'Error rejecting payment' });
    }
});

module.exports = router;
