// backend/models/query.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const querySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    orderId: { type: String },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Query = mongoose.model('Query', querySchema);
module.exports = Query;