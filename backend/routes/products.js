// backend/routes/products.js
// This is the complete and final version of this file.
// Please replace the entire contents of your local products.js file with this code
// to ensure there are no conflicting or duplicate routes.

const router = require('express').Router();
const Product = require('../models/product.model');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @desc   Fetch all products OR search products with smart matching
// @route  GET /products
// @access Public
router.get('/', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        let products;

        if (keyword) {
            if (keyword.length < 3) {
                // Use simple "starts with" regex for short keywords
                products = await Product.find({
                    name: {
                        $regex: `^${keyword}`, // ^ means "starts with"
                        $options: 'i'
                    }
                });
            } else {
                // Use Atlas Search for longer, fuzzy queries
                products = await Product.aggregate([
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
            }
        } else {
            // No keyword, fetch all products
            products = await Product.find({});
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
        res.json(suggestions.map(s => ({ value: s.name }))); // Format for Ant Design
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

        const { name, price, description } = req.body;

        // Check if main image file was uploaded
        if (!req.files || !req.files.image) {
            console.log('No main image uploaded');
            return res.status(400).json({ message: 'Please upload a main product image' });
        }

        console.log('Uploading main image to Cloudinary...');
        // Upload main image to Cloudinary
        const mainImageResult = await cloudinary.uploader.upload(
            `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString("base64")}`,
            {
                folder: 'ecommerce-products',
                resource_type: 'auto'
            }
        );
        console.log('Main image uploaded:', mainImageResult.secure_url);

        // Upload additional images if present
        const additionalImageUrls = [];
        if (req.files.additionalImages && req.files.additionalImages.length > 0) {
            console.log(`Uploading ${req.files.additionalImages.length} additional images...`);
            for (const file of req.files.additionalImages) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    {
                        folder: 'ecommerce-products',
                        resource_type: 'auto'
                    }
                );
                additionalImageUrls.push(result.secure_url);
                console.log('Additional image uploaded:', result.secure_url);
            }
        }

        // Create product with Cloudinary image URLs
        const product = new Product({
            name,
            price,
            description,
            image: mainImageResult.secure_url,
            images: additionalImageUrls
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
        const { name, price, description, existingImages } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name;
            product.price = price;
            product.description = description;

            // If a new main image was uploaded, update it
            if (req.files && req.files.image) {
                const result = await cloudinary.uploader.upload(
                    `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString("base64")}`,
                    {
                        folder: 'ecommerce-products',
                        resource_type: 'auto'
                    }
                );
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

                    const result = await cloudinary.uploader.upload(
                        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                        {
                            folder: 'ecommerce-products',
                            resource_type: 'auto'
                        }
                    );
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
