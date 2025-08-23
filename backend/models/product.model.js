// backend/models/product.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, {
    timestamps: true,
});

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  reviews: [reviewSchema], // Add this
  rating: { type: Number, required: true, default: 0 }, // Add this
  numReviews: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;