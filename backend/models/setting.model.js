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
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;