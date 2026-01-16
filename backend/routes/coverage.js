// backend/routes/coverage.js
const router = require('express').Router();

const { DeliveryCoverage, COVERAGE_TYPES } = require('../models/deliveryCoverage.model');
const { protect, admin } = require('../middleware/authMiddleware');

function isValidType(type) {
    return COVERAGE_TYPES.includes(type);
}

// List coverage entries by type (admin)
router.get('/', protect, admin, async (req, res) => {
    const { type } = req.query;

    if (!type || !isValidType(type)) {
        return res.status(400).json({ message: `Invalid type. Must be one of: ${COVERAGE_TYPES.join(', ')}` });
    }

    const items = await DeliveryCoverage.find({ type }).sort({ normalizedValue: 1 });
    res.json(items);
});

// Create a coverage entry (admin)
router.post('/', protect, admin, async (req, res) => {
    const { type, value } = req.body;

    if (!type || !isValidType(type)) {
        return res.status(400).json({ message: `Invalid type. Must be one of: ${COVERAGE_TYPES.join(', ')}` });
    }

    if (value === undefined || value === null || String(value).trim() === '') {
        return res.status(400).json({ message: 'Value is required' });
    }

    try {
        const created = await DeliveryCoverage.create({ type, value: String(value) });
        res.status(201).json(created);
    } catch (err) {
        // Duplicate key error (unique index)
        if (err && err.code === 11000) {
            return res.status(400).json({ message: 'Coverage entry already exists' });
        }
        throw err;
    }
});

// Delete a coverage entry (admin)
router.delete('/:id', protect, admin, async (req, res) => {
    const item = await DeliveryCoverage.findById(req.params.id);

    if (!item) {
        return res.status(404).json({ message: 'Coverage entry not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Coverage entry removed' });
});

module.exports = router;
