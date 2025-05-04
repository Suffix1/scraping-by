const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Product Model', () => {
    beforeEach(async () => {
        await Product.deleteMany({});
    });

    it('should create a new product successfully', async () => {
        const productData = {
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        };

        const product = new Product(productData);
        const savedProduct = await product.save();

        expect(savedProduct._id).toBeDefined();
        expect(savedProduct.url).toBe(productData.url);
        expect(savedProduct.size).toBe(productData.size);
        expect(savedProduct.name).toBe(productData.name);
        expect(savedProduct.currentPrice).toBe(productData.currentPrice);
        expect(savedProduct.originalPrice).toBe(productData.originalPrice);
        expect(savedProduct.lastChecked).toBeDefined();
        expect(savedProduct.emailSent).toBe(false);
    });

    it('should not create a product without required fields', async () => {
        const productData = {
            url: 'https://www.uniqlo.com/nl/nl/test-product'
        };

        const product = new Product(productData);
        await expect(product.save()).rejects.toThrow();
    });

    it('should not allow duplicate URLs', async () => {
        const productData = {
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        };

        const product1 = new Product(productData);
        await product1.save();

        const product2 = new Product(productData);
        await expect(product2.save()).rejects.toThrow();
    });
}); 