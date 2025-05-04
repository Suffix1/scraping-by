const request = require('supertest');
const mongoose = require('mongoose');
const Product = require('../../models/Product');
const app = require('../../server');
const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');

// Mock the scraper to avoid actual web requests
jest.mock('../../scrapers/uniqlo', () => ({
    scrapeUniqloProduct: jest.fn().mockResolvedValue({
        name: 'Test Product',
        currentPrice: 29.99,
        originalPrice: 39.99,
        sizeAvailable: true
    })
}));

describe('Product Routes', () => {
    beforeEach(async () => {
        await Product.deleteMany({});
        jest.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('should return empty array when no products exist', async () => {
            const response = await request(app).get('/api/products');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return all products', async () => {
            const product = new Product({
                url: 'https://www.uniqlo.com/nl/nl/test-product',
                size: 'M',
                name: 'Test Product',
                currentPrice: 29.99,
                originalPrice: 39.99
            });
            await product.save();

            const response = await request(app).get('/api/products');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].name).toBe('Test Product');
        });
    });

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const productData = {
                url: 'https://www.uniqlo.com/nl/nl/test-product',
                size: 'M'
            };

            const response = await request(app)
                .post('/api/products')
                .send(productData);

            expect(response.status).toBe(201);
            expect(response.body.url).toBe(productData.url);
            expect(response.body.size).toBe(productData.size);
            expect(scrapeUniqloProduct).toHaveBeenCalledWith(productData.url, productData.size);
        });

        it('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product', async () => {
            const product = new Product({
                url: 'https://www.uniqlo.com/nl/nl/test-product',
                size: 'M',
                name: 'Test Product',
                currentPrice: 29.99,
                originalPrice: 39.99
            });
            await product.save();

            const response = await request(app)
                .delete(`/api/products/${product._id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product deleted');

            const deletedProduct = await Product.findById(product._id);
            expect(deletedProduct).toBeNull();
        });

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .delete('/api/products/123456789012');

            expect(response.status).toBe(404);
        });
    });
}); 