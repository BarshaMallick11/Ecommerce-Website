// backend/routes/queries.js
const router = require('express').Router();
const Query = require('../models/query.model');
const { protect, admin } = require('../middleware/authMiddleware');

// Submit a new query (public)
router.post('/', async (req, res) => {
    const { name, email, orderId, message } = req.body;
    const newQuery = new Query({ name, email, orderId, message });
    await newQuery.save();
    res.status(201).json({ message: 'Query submitted successfully!' });
});

// Get all queries (admin)
router.get('/', protect, admin, async (req, res) => {
    const queries = await Query.find({}).sort({ createdAt: -1 });
    res.json(queries);
});

// Mark query as resolved (admin)
router.put('/:id/resolve', protect, admin, async (req, res) => {
    const query = await Query.findById(req.params.id);
    if (query) {
        query.isResolved = true;
        await query.save();
        res.json({ message: 'Query marked as resolved.' });
    } else {
        res.status(404).json({ message: 'Query not found.' });
    }
});

module.exports = router;