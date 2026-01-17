// backend/models/banner.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    backgroundColor: {
        type: String,
        default: '#10b981'
    },
    textColor: {
        type: String,
        default: '#ffffff'
    },
    icon: {
        type: String,
        enum: ['gift', 'percent', 'truck', 'star', 'heart', 'tag', 'none'],
        default: 'gift'
    },
    link: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
