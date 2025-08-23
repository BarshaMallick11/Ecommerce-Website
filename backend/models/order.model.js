// backend/models/order.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    //isDelivered: { type: Boolean, default: false },
    shippingAddress: { // Add this object
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phoneNo: { type: String, required: true },
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['Processing', 'Shipped', 'Delivered'], 
        default: 'Processing' 
    },
    trackingNumber: { type: String, default: '' },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
