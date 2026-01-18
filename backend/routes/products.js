// backend/routes/products.js
// This is the complete and final version of this file.
// Please replace the entire contents of your local products.js file with this code
// to ensure there are no conflicting or duplicate routes.

const router = require('express').Router();
const Product = require('../models/product.model');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @desc   Fetch all products OR search products OR filter by category
// @route  GET /products?keyword=tea&category=fruits
// @access Public
router.get('/', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const categorySlug = req.query.category;
        let products;
        let query = {};

        // Handle category filtering
        if (categorySlug) {
            const Category = require('../models/category.model');
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                query.category = category._id;
            }
        }

        if (keyword) {
            if (keyword.length < 3) {
                // Use simple "starts with" regex for short keywords
                query.name = {
                    $regex: `^${keyword}`, // ^ means "starts with"
                    $options: 'i'
                };
                products = await Product.find(query).populate('category');
            } else {
                // Use Atlas Search for longer, fuzzy queries
                const searchResults = await Product.aggregate([
                    {
                        $search: {
                            index: 'default',
                            text: {
                                query: keyword,
                                path: 'name',
                                fuzzy: {
                                    maxEdits: 2,
                                    prefixLength: 3
                                }
                            }
                        }
                    }
                ]);

                // Apply category filter if present
                if (query.category) {
                    products = searchResults.filter(p => p.category && p.category.toString() === query.category.toString());
                } else {
                    products = searchResults;
                }
            }
        } else {
            // No keyword, fetch all products (optionally filtered by category)
            products = await Product.find(query).populate('category');
        }
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Get product name suggestions for autocomplete
// @route  GET /products/autocomplete
// @access Public
router.get('/autocomplete', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.json([]);
        }

        const suggestions = await Product.aggregate([
            {
                $search: {
                    index: 'autocomplete', // Use the new autocomplete index
                    autocomplete: {
                        query: query,
                        path: 'name',
                        tokenOrder: 'sequential'
                    }
                }
            },
            {
                $limit: 10 // Limit to 10 suggestions
            },
            {
                $project: {
                    _id: 0,
                    name: 1
                }
            }
        ]);
        res.json(suggestions.map(s => ({ value: s.name, label: s.name }))); // Format for both desktop and mobile
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc   Fetch single product
// @route  GET /products/:id
// @access Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Create a product
// @route  POST /products
// @access Private/Admin
router.post('/', protect, admin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), async (req, res) => {
    try {
        console.log('=== Product Creation Request ===');
        console.log('Body:', req.body);
        console.log('Files:', req.files);
        console.log('Quantity received:', req.body.quantity, 'Type:', typeof req.body.quantity);
        console.log('Discount received:', req.body.discount, 'Type:', typeof req.body.discount);
        console.log('Unit received:', req.body.unit);
        console.log('Category received:', req.body.category);

        const { name, price, description, quantity, stock, discount, unit, category, hasVariants, unitVariants } = req.body;

        // Check if main image file was uploaded
        if (!req.files || !req.files.image) {
            console.log('No main image uploaded');
            return res.status(400).json({ message: 'Please upload a main product image' });
        }

        console.log('Uploading main image to Cloudinary...');
        // Helper to upload buffer to Cloudinary
        const uploadBuffer = (buffer, mimetype, options) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
            stream.end(buffer);
          });
        };

        // Upload main image to Cloudinary
        const mainImageResult = await uploadBuffer(req.files.image[0].buffer, req.files.image[0].mimetype, {
            folder: 'ecommerce-products',
            resource_type: 'auto'
        });
        console.log('Main image uploaded:', mainImageResult.secure_url);

        // Upload additional images if present
        const additionalImageUrls = [];
        if (req.files.additionalImages && req.files.additionalImages.length > 0) {
            console.log(`Uploading ${req.files.additionalImages.length} additional images...`);
            for (const file of req.files.additionalImages) {
                const result = await uploadBuffer(file.buffer, file.mimetype, {
                    folder: 'ecommerce-products',
                    resource_type: 'auto'
                });
                additionalImageUrls.push(result.secure_url);
                console.log('Additional image uploaded:', result.secure_url);
            }
        }

        // Create product with Cloudinary image URLs
        // Convert quantity and discount to numbers (they come as strings from FormData)
        // Parse unit variants if present
        let parsedUnitVariants = [];
        if (hasVariants === 'true' && unitVariants) {
            try {
                parsedUnitVariants = JSON.parse(unitVariants);
            } catch (e) {
                console.error('Error parsing unitVariants:', e);
            }
        }

        const product = new Product({
            name,
            price: Number(price),
            description,
            category: category || null,
            quantity: Number(quantity) || 0,
            stock: Number(stock) || 0,
            unit: unit || 'Kg',
            discount: Number(discount) || 0,
            image: mainImageResult.secure_url,
            images: additionalImageUrls,
            hasVariants: hasVariants === 'true',
            unitVariants: parsedUnitVariants,
            rating: 0,
            numReviews: 0,
            reviews: []
        });

        const createdProduct = await product.save();
        console.log('Product created successfully:', createdProduct._id);
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
});

// @desc   Update a product
// @route  PUT /products/:id
// @access Private/Admin
router.put('/:id', protect, admin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const { name, price, description, quantity, stock, discount, unit, category, existingImages, hasVariants, unitVariants } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name;
            product.price = Number(price);
            product.description = description;
            product.category = category || product.category;
            product.quantity = quantity !== undefined ? Number(quantity) : product.quantity;
            product.stock = stock !== undefined ? Number(stock) : product.stock;
            product.unit = unit || product.unit;
            product.discount = discount !== undefined ? Number(discount) : product.discount;

            // Handle unit variants
            product.hasVariants = hasVariants === 'true' || hasVariants === true;
            if (product.hasVariants && unitVariants) {
                try {
                    product.unitVariants = typeof unitVariants === 'string' ? JSON.parse(unitVariants) : unitVariants;
                } catch (e) {
                    console.error('Error parsing unitVariants:', e);
                }
            } else {
                product.unitVariants = [];
            }

            // Helper to upload buffer to Cloudinary (defined in POST, reuse if possible or redefine)
            const uploadBuffer = (buffer, mimetype, options) => {
              return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                });
                stream.end(buffer);
              });
            };

            // If a new main image was uploaded, update it
            if (req.files && req.files.image) {
                const result = await uploadBuffer(req.files.image[0].buffer, req.files.image[0].mimetype, {
                    folder: 'ecommerce-products',
                    resource_type: 'auto'
                });
                product.image = result.secure_url;
                console.log('Main image updated:', result.secure_url);
            }

            // Handle additional images
            let updatedAdditionalImages = [];

            // Keep existing images that weren't removed
            if (existingImages) {
                const existingImagesArray = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
                updatedAdditionalImages = [...existingImagesArray];
                console.log('Keeping existing images:', updatedAdditionalImages);
            }

            // Upload new additional images
            if (req.files && req.files.additionalImages && req.files.additionalImages.length > 0) {
                console.log(`Uploading ${req.files.additionalImages.length} new additional images...`);
                for (const file of req.files.additionalImages) {
                    // Check if we haven't exceeded the limit
                    if (updatedAdditionalImages.length >= 5) {
                        console.log('Maximum 5 additional images reached');
                        break;
                    }

                    const result = await uploadBuffer(file.buffer, file.mimetype, {
                        folder: 'ecommerce-products',
                        resource_type: 'auto'
                    });
                    updatedAdditionalImages.push(result.secure_url);
                    console.log('Additional image uploaded:', result.secure_url);
                }
            }

            product.images = updatedAdditionalImages;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// @desc   Delete a product
// @route  DELETE /products/:id
// @access Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Create new review
// @route  POST /products/:id/reviews
// @access Private
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.username,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
