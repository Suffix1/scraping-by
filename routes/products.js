const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { scrapeUniqloProduct } = require('../scrapers/uniqlo');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new product
router.post('/', async (req, res) => {
    try {
        const { url, size } = req.body;
        
        // Scrape product information
        const productInfo = await scrapeUniqloProduct(url, size);
        
        const product = new Product({
            url,
            size,
            name: productInfo.name,
            currentPrice: productInfo.currentPrice,
            originalPrice: productInfo.originalPrice
        });
        
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 