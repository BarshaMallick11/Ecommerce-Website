// backend/routes/shipping.js
const router = require('express').Router();
const Pincode = require('../models/pincode.model');

router.post('/check-pincode', async (req, res) => {
    const { postalCode } = req.body;
    const pincode = await Pincode.findOne({ code: postalCode });
    if (pincode) {
        res.json({ serviceable: true });
    } else {
        res.json({ serviceable: false });
    }
});

module.exports = router;
