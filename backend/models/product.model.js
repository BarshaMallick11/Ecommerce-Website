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
  image: { type: String, required: true }, // Main image (backward compatible)
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 5; // Maximum 5 images
      },
      message: 'Maximum 5 images allowed per product'
    }
  }, // Additional images (up to 5 total)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // Making it optional for backward compatibility
  },
  quantity: { type: Number, default: 0 }, // Stock quantity
  unit: { type: String, enum: ['gm', 'Kg', 'L'], default: 'Kg' }, // Unit of measurement
  discount: { type: Number, default: 0, min: 0, max: 100 }, // Discount percentage (0-100)
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;