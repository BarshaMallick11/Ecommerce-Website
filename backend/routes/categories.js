// backend/routes/categories.js
const router = require('express').Router();
const Category = require('../models/category.model');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @desc   Fetch all categories
// @route  GET /categories
// @access Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Get category by slug
// @route  GET /categories/:slug
// @access Public
router.get('/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug, isActive: true });
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Create a category
// @route  POST /categories
// @access Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { name, slug, description } = req.body;

        console.log('Creating category:', { name, slug });

        const categoryExists = await Category.findOne({ slug });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category with this slug already exists' });
        }

        // Upload image to Cloudinary if provided
        let imageUrl = '';
        if (req.file) {
            console.log('Uploading category image to Cloudinary...');
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                {
                    folder: 'ecommerce-categories',
                    resource_type: 'auto'
                }
            );
            imageUrl = result.secure_url;
            console.log('Image uploaded:', imageUrl);
        } else {
            return res.status(400).json({ message: 'Please upload a category image' });
        }

        const category = new Category({
            name,
            slug,
            image: imageUrl,
            description
        });

        const createdCategory = await category.save();
        console.log('Category created successfully:', createdCategory._id);
        res.status(201).json(createdCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc   Update a category
// @route  PUT /categories/:id
// @access Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.slug = slug || category.slug;
            category.description = description !== undefined ? description : category.description;
            category.isActive = isActive !== undefined ? isActive : category.isActive;

            // Upload new image if provided
            if (req.file) {
                console.log('Uploading new category image...');
                const result = await cloudinary.uploader.upload(
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                    {
                        folder: 'ecommerce-categories',
                        resource_type: 'auto'
                    }
                );
                category.image = result.secure_url;
                console.log('New image uploaded:', result.secure_url);
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(400).json({ message: error.message });
    }
});

// @desc   Delete a category
// @route  DELETE /categories/:id
// @access Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
