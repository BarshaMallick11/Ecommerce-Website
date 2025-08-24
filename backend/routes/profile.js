// backend/routes/profile.js
const router = require('express').Router();
const User = require('../models/user.model');
const { protect } = require('../middleware/authMiddleware');

// @desc   Get user profile (including addresses)
// @route  GET /api/profile
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Add a new shipping address
// @route  POST /api/profile/address
// @access Private
router.post('/address', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.shippingAddresses.push(req.body);
            const updatedUser = await user.save();
            res.status(201).json(updatedUser.shippingAddresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error adding address' });
    }
});
// @desc   Update user profile
// @route  PUT /api/profile
// @access Private
router.put('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc   Update a shipping address
// @route  PUT /api/profile/address/:id
// @access Private
router.put('/address/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const address = user.shippingAddresses.id(req.params.id);
            if (address) {
                Object.assign(address, req.body);
                await user.save();
                res.json(user.shippingAddresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating address' });
    }
});

// @desc   Delete a shipping address
// @route  DELETE /api/profile/address/:id
// @access Private
router.delete('/address/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const address = user.shippingAddresses.id(req.params.id);
            if (address) {
                address.deleteOne(); // Correct way to remove subdocument
                await user.save();
                res.json(user.shippingAddresses);
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error); // Log the actual error
        res.status(500).json({ message: 'Error deleting address' });
    }
});

module.exports = router;