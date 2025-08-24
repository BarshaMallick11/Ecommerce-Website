// backend/models/user.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNo: { type: String, required: true },
});
const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isAdmin: { type: Boolean, default: false },
    shippingAddresses: [addressSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;