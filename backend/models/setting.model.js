// backend/models/setting.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({
    contactPhone: { type: String, default: '+91 909352 3407' },
    contactEmail: { type: String, default: 'premium.store2007@gmail.com' },
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;