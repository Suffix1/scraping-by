const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    size: {
        type: String,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    lastChecked: {
        type: Date,
        default: Date.now
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema); 