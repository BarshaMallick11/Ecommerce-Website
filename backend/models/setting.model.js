// backend/models/setting.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({
    contactPhone: { type: String, default: '+91 12345 67890' },
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;