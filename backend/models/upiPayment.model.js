// backend/models/upiPayment.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upiPaymentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    utr: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentScreenshot: {
        type: String,
        required: true
    },
    payeeName: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    verificationNote: {
        type: String
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
}, {
    timestamps: true,
});

// Index for faster queries
upiPaymentSchema.index({ user: 1, status: 1 });

const UpiPayment = mongoose.model('UpiPayment', upiPaymentSchema);
module.exports = UpiPayment;
