// backend/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
let User = require('../models/user.model');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc   Handle forgot password request
// @route  POST /api/auth/forgot-password
// @access Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: message,
        });

        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Handle password reset
// @route  POST /api/auth/reset-password/:token
// @access Public
router.post('/reset-password/:token', async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.status(201).json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Handle forgot password request
// @route  POST /api/auth/forgot-password
// @access Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // We send a success message even if the user is not found
            // This is a security measure to prevent email enumeration
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // --- In a real application, you would do the following: ---
        // 1. Generate a unique, secure password reset token.
        // 2. Save the token and its expiry date to the user document in the database.
        // 3. Use an email service (like Nodemailer) to send an email to the user
        //    with a link containing the reset token (e.g., /reset-password/your-token).

        console.log(`--- Password Reset Request for ${email} ---`);
        console.log(`(In a real app, an email would be sent)`);

        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;