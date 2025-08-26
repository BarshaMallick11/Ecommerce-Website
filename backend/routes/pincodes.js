// backend/routes/pincodes.js
const router = require('express').Router();
const Pincode = require('../models/pincode.model');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all pincodes (admin)
router.get('/', protect, admin, async (req, res) => {
    const pincodes = await Pincode.find({});
    res.json(pincodes);
});

// Add a pincode (admin)
router.post('/', protect, admin, async (req, res) => {
    const { code } = req.body;
    const pincodeExists = await Pincode.findOne({ code });
    if (pincodeExists) {
        return res.status(400).json({ message: 'Pincode already exists' });
    }
    const pincode = new Pincode({ code });
    const createdPincode = await pincode.save();
    res.status(201).json(createdPincode);
});

// Delete a pincode (admin)
router.delete('/:id', protect, admin, async (req, res) => {
    const pincode = await Pincode.findById(req.params.id);
    if (pincode) {
        await pincode.deleteOne();
        res.json({ message: 'Pincode removed' });
    } else {
        res.status(404).json({ message: 'Pincode not found' });
    }
});

module.exports = router;