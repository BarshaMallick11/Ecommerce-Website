// backend/routes/users.js
const router = require('express').Router();
const User = require('../models/user.model');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc   Get all users
// @route  GET /api/users
// @access Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Delete a user
// @route  DELETE /api/users/:id
// @access Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Add a check to prevent deleting an admin's own account
            if(req.user._id.equals(user._id)) {
                return res.status(400).json({ message: 'Cannot delete admin account' });
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Update user to be an admin
// @route  PUT /api/users/:id/make-admin
// @access Private/Admin
router.put('/:id/make-admin', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isAdmin = true;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;