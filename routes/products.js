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
        const { url } = req.body;
        
        // Validate input
        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }
        
        // Scrape product information
        console.log(`Checking price for ${url}...`);
        const productInfo = await scrapeUniqloProduct(url);
        console.log(`Found product: ${productInfo.name}, Current price: €${productInfo.currentPrice}, Original price: €${productInfo.originalPrice}`);
        
        // Check if it's on sale
        let onSale = productInfo.currentPrice < productInfo.originalPrice;
        
        // Create new product
        const newProduct = await Product.create({
            url,
            name: productInfo.name,
            currentPrice: productInfo.currentPrice,
            originalPrice: productInfo.originalPrice,
            onSale: onSale
        });
        
        // Return product with sale status
        res.status(201).json({
            ...newProduct,
            onSale,
            message: onSale ? `Product is on sale! (€${productInfo.originalPrice.toFixed(2)} → €${productInfo.currentPrice.toFixed(2)})` : 'Product is not on sale'
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const success = await Product.findByIdAndDelete(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 