// backend/routes/shipping.js
const router = require('express').Router();

const Pincode = require('../models/pincode.model');
const { DeliveryCoverage, normalizeText, normalizePincode } = require('../models/deliveryCoverage.model');

function firstNonEmpty(...values) {
    for (const v of values) {
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return '';
}

async function checkAnyCoverageMatch({ postalCode, state, district, city }) {
    const pin = normalizePincode(postalCode);
    const st = normalizeText(state);
    const dist = normalizeText(firstNonEmpty(district, city));

    const or = [];
    if (pin) or.push({ type: 'PINCODE', normalizedValue: pin });
    if (dist) or.push({ type: 'DISTRICT', normalizedValue: dist });
    if (st) or.push({ type: 'STATE', normalizedValue: st });

    if (or.length === 0) {
        return { serviceable: false, matchedOn: null };
    }

    const match = await DeliveryCoverage.findOne({ $or: or }).lean();

    if (!match) {
        return { serviceable: false, matchedOn: null };
    }

    return { serviceable: true, matchedOn: match.type };
}

// New: Multi-level coverage check (public)
router.post('/check-coverage', async (req, res) => {
    const { postalCode, state, district, city } = req.body || {};

    const result = await checkAnyCoverageMatch({ postalCode, state, district, city });
    res.json(result);
});

// Backward-compatible: Pincode-only endpoint (public)
router.post('/check-pincode', async (req, res) => {
    const { postalCode } = req.body || {};

    // Prefer new unified coverage (type=PINCODE)
    const pin = normalizePincode(postalCode);
    if (pin) {
        const match = await DeliveryCoverage.findOne({ type: 'PINCODE', normalizedValue: pin }).lean();
        if (match) {
            return res.json({ serviceable: true });
        }
    }

    // Fallback to legacy pincode collection
    const pincode = await Pincode.findOne({ code: postalCode }).lean();
    if (pincode) {
        res.json({ serviceable: true });
    } else {
        res.json({ serviceable: false });
    }
});

module.exports = router;
