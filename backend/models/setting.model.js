// backend/models/setting.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({
    contactPhone: { type: String, default: '+91 909352 3407' },
    contactEmail: { type: String, default: 'premium.store2007@gmail.com' },

    // UPI Payment Settings
    upiId: { type: String, default: 'yourname@okaxis' },
    upiQrCodeUrl: { type: String, default: '/upi-qr-code.png' },
    upiEnabled: { type: Boolean, default: true },

    // Delivery Charge Settings
    deliveryCharge: { type: Number, default: 40 },           // Default delivery charge in Rs
    freeDeliveryThreshold: { type: Number, default: 399 },   // Free delivery above this amount
    deliveryChargeEnabled: { type: Boolean, default: true },  // Enable/disable delivery charges

    // Order Limit Settings
    maxQuantityPerProduct: { type: Number, default: 5, min: 1, max: 100 },  // Max units per product per order
    orderLimitEnabled: { type: Boolean, default: true },      // Enable/disable order limits

    // Payment Method Settings
    razorpayEnabled: { type: Boolean, default: true },       // Enable/disable Razorpay online payments
    upiManualEnabled: { type: Boolean, default: true },       // Enable/disable UPI manual payments
    codEnabled: { type: Boolean, default: true },             // Enable/disable Cash on Delivery
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;