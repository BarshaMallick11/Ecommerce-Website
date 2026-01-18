// backend/routes/settings.js
const router = require('express').Router();
const Setting = require('../models/setting.model');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for QR code uploads
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'upi-qr-codes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get settings (public)
router.get('/', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await new Setting().save(); // Create default settings if none exist
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

// Upload UPI QR Code (admin)
router.post('/upload-qr', protect, admin, (req, res, next) => {
    upload.single('qrCode')(req, res, (err) => {
        if (err) {
            console.error('QR Code Upload Error:', err);
            return res.status(400).json({
                message: 'QR code upload failed',
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the Cloudinary URL
        res.json({
            url: req.file.path,
            message: 'QR code uploaded successfully'
        });
    });
});

// Update settings (admin)
router.put('/', protect, admin, async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
        }

        // Update all fields
        settings.contactPhone = req.body.contactPhone || settings.contactPhone;
        settings.contactEmail = req.body.contactEmail || settings.contactEmail;
        settings.upiId = req.body.upiId || settings.upiId;
        settings.upiQrCodeUrl = req.body.upiQrCodeUrl || settings.upiQrCodeUrl;
        settings.upiEnabled = req.body.upiEnabled !== undefined ? req.body.upiEnabled : settings.upiEnabled;

        // Delivery Charge Settings
        if (req.body.deliveryCharge !== undefined) {
            settings.deliveryCharge = req.body.deliveryCharge;
        }
        if (req.body.freeDeliveryThreshold !== undefined) {
            settings.freeDeliveryThreshold = req.body.freeDeliveryThreshold;
        }
        if (req.body.deliveryChargeEnabled !== undefined) {
            settings.deliveryChargeEnabled = req.body.deliveryChargeEnabled;
        }

        // Order Limit Settings
        if (req.body.maxQuantityPerProduct !== undefined) {
            settings.maxQuantityPerProduct = req.body.maxQuantityPerProduct;
        }
        if (req.body.orderLimitEnabled !== undefined) {
            settings.orderLimitEnabled = req.body.orderLimitEnabled;
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        console.error('Settings Update Error:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
});

module.exports = router;