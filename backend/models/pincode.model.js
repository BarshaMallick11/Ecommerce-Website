// backend/models/pincode.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pincodeSchema = new Schema({
    code: { type: String, required: true, unique: true },
});

const Pincode = mongoose.model('Pincode', pincodeSchema);
module.exports = Pincode;
