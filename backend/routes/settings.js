// backend/routes/settings.js
const router = require('express').Router();
const Setting = require('../models/setting.model');
const { protect, admin } = require('../middleware/authMiddleware');

// Get settings (public)
router.get('/', async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await new Setting().save(); // Create default settings if none exist
    }
    res.json(settings);
});

// Update settings (admin)
router.put('/', protect, admin, async (req, res) => {
    let settings = await Setting.findOne();
    settings.contactPhone = req.body.contactPhone || settings.contactPhone;
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

module.exports = router;