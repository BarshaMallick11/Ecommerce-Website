// backend/seedCategories.js
// Run this file to seed initial categories: node seedCategories.js

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/category.model');

const uri = process.env.ATLAS_URI;

const categories = [
    {
        name: 'Fruits',
        slug: 'fruits',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
        description: 'Fresh seasonal fruits'
    },
    {
        name: 'Fresh',
        slug: 'fresh',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop',
        description: 'Fresh vegetables and greens'
    },
    {
        name: 'Snacks',
        slug: 'snacks',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&h=200&fit=crop',
        description: 'Tasty snacks and chips'
    },
    {
        name: 'Grocery',
        slug: 'grocery',
        image: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=200&h=200&fit=crop',
        description: 'Essential grocery items'
    },
    {
        name: 'Nuts',
        slug: 'nuts',
        image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=200&h=200&fit=crop',
        description: 'Dry fruits and nuts'
    },
    {
        name: 'Oils',
        slug: 'oils',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
        description: 'Cooking oils and ghee'
    }
];

async function seedCategories() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Insert new categories
        await Category.insertMany(categories);
        console.log('Successfully seeded categories:');
        console.log(categories.map(c => `- ${c.name} (${c.slug})`).join('\n'));

        await mongoose.connection.close();
        console.log('\n✅ Category seeding complete!');
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
