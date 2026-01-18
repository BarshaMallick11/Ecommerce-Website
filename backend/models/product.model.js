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

// Unit variant schema for multiple unit options with different prices
const unitVariantSchema = new Schema({
  label: { type: String, required: true }, // e.g., "250g", "500g", "1Kg"
  value: { type: Number, required: true }, // numeric value e.g., 250, 500, 1000
  unit: { type: String, enum: ['gm', 'Kg', 'L', 'ml', 'pc', 'pack'], required: true },
  price: { type: Number, required: true }, // price for this variant
  stock: { type: Number, default: 0 }, // stock for this variant
  isDefault: { type: Boolean, default: false } // mark default selected variant
}, { _id: true });

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Base price (for backward compatibility)
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
  quantity: { type: Number, default: 0 }, // Stock quantity (legacy)
  stock: { type: Number, default: 0 }, // Available stock count (legacy/total)
  unit: { type: String, enum: ['gm', 'Kg', 'L', 'ml', 'pc', 'pack'], default: 'Kg' }, // Default unit
  discount: { type: Number, default: 0, min: 0, max: 100 }, // Discount percentage (0-100)

  // Multi-unit variants (like grocery apps)
  unitVariants: {
    type: [unitVariantSchema],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 10; // Maximum 10 variants
      },
      message: 'Maximum 10 unit variants allowed per product'
    }
  },
  hasVariants: { type: Boolean, default: false }, // Flag to indicate if product has multiple variants

  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;