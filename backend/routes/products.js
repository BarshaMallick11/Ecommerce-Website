// backend/routes/products.js
const router = require('express').Router();
const Product = require('../models/product.model');
const { protect, admin } = require('../middleware/authMiddleware');

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
router.post('/', protect, admin, async (req, res) => {
    const { name, price, description, image } = req.body;
    const product = new Product({ name, price, description, image });
    try {
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc   Update a product
// @route  PUT /products/:id
// @access Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, price, description, image } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name;
            product.price = price;
            product.description = description;
            product.image = image;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
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

module.exports = router;
