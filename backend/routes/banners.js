// backend/routes/banners.js
const router = require('express').Router();
const Banner = require('../models/banner.model');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @desc   Test endpoint
// @route  GET /api/banners/test
// @access Public
router.get('/test', (req, res) => {
    res.json({ message: 'Banners route is working!' });
});

// @desc   Fetch all active banners (for public/user view)
// @route  GET /api/banners
// @access Public
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Fetch all banners (for admin view - includes inactive)
// @route  GET /api/banners/admin
// @access Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching admin banners:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Get single banner by ID
// @route  GET /api/banners/:id
// @access Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            res.json(banner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc   Create a banner
// @route  POST /api/banners
// @access Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, backgroundColor, textColor, icon, link, order, isActive } = req.body;

        console.log('Creating banner:', { title, subtitle });

        let imageUrl = '';

        // Upload image to Cloudinary if provided
        if (req.file) {
            console.log('Uploading banner image to Cloudinary...');
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                {
                    folder: 'ecommerce-banners',
                    resource_type: 'auto'
                }
            );
            imageUrl = result.secure_url;
            console.log('Image uploaded:', imageUrl);
        }

        const banner = new Banner({
            title,
            subtitle,
            image: imageUrl,
            backgroundColor: backgroundColor || '#10b981',
            textColor: textColor || '#ffffff',
            icon: icon || 'gift',
            link: link || '',
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        const createdBanner = await banner.save();
        console.log('Banner created successfully:', createdBanner._id);
        res.status(201).json(createdBanner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc   Update a banner
// @route  PUT /api/banners/:id
// @access Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, backgroundColor, textColor, icon, link, order, isActive } = req.body;
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            banner.title = title || banner.title;
            banner.subtitle = subtitle || banner.subtitle;
            banner.backgroundColor = backgroundColor || banner.backgroundColor;
            banner.textColor = textColor || banner.textColor;
            banner.icon = icon || banner.icon;
            banner.link = link !== undefined ? link : banner.link;
            banner.order = order !== undefined ? order : banner.order;
            banner.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : banner.isActive;

            // Upload new image if provided
            if (req.file) {
                console.log('Uploading new banner image...');
                const result = await cloudinary.uploader.upload(
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                    {
                        folder: 'ecommerce-banners',
                        resource_type: 'auto'
                    }
                );
                banner.image = result.secure_url;
                console.log('New image uploaded:', banner.image);
            }

            const updatedBanner = await banner.save();
            console.log('Banner updated successfully:', updatedBanner._id);
            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc   Toggle banner active status
// @route  PATCH /api/banners/:id/toggle
// @access Private/Admin
router.patch('/:id/toggle', protect, admin, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            banner.isActive = !banner.isActive;
            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        console.error('Error toggling banner:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc   Delete a banner
// @route  DELETE /api/banners/:id
// @access Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            await Banner.deleteOne({ _id: req.params.id });
            res.json({ message: 'Banner removed' });
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
