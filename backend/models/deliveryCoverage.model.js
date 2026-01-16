// backend/models/deliveryCoverage.model.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const COVERAGE_TYPES = ['STATE', 'DISTRICT', 'PINCODE'];

function normalizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizePincode(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim();
}

const deliveryCoverageSchema = new Schema(
    {
        type: { type: String, required: true, enum: COVERAGE_TYPES },
        value: { type: String, required: true },
        normalizedValue: { type: String, required: true },
    },
    { timestamps: true }
);

// Prevent duplicates like “Kolkata” vs “kolkata”.
deliveryCoverageSchema.index({ type: 1, normalizedValue: 1 }, { unique: true });

// Compute normalizedValue on validate to keep it consistent.
deliveryCoverageSchema.pre('validate', function (next) {
    if (this.value !== undefined && this.value !== null) {
        if (this.type === 'PINCODE') {
            this.normalizedValue = normalizePincode(this.value);
        } else {
            this.normalizedValue = normalizeText(this.value);
        }
    }
    next();
});

const DeliveryCoverage = mongoose.model('DeliveryCoverage', deliveryCoverageSchema);

module.exports = {
    DeliveryCoverage,
    COVERAGE_TYPES,
    normalizeText,
    normalizePincode,
};
