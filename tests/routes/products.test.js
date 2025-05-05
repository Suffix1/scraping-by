const request = require('supertest');
const app = require('../../server');
const Product = require('../../models/Product');
const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');

// Mock dependencies
jest.mock('../../models/Product');
jest.mock('../../scrapers/uniqlo');

describe('Product Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('should return empty array when no products exist', async () => {
            // Mock empty products array
            Product.find.mockResolvedValueOnce([]);
            
            const response = await request(app).get('/api/products');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(Product.find).toHaveBeenCalled();
        });

        it('should return all products', async () => {
            // Mock products array
            const mockProducts = [
                {
                    _id: 'test-id-1',
                    url: 'https://www.uniqlo.com/nl/nl/test-product-1',
                    name: 'Test Product 1',
                    currentPrice: 29.99,
                    originalPrice: 39.99
                },
                {
                    _id: 'test-id-2',
                    url: 'https://www.uniqlo.com/nl/nl/test-product-2',
                    name: 'Test Product 2',
                    currentPrice: 19.99,
                    originalPrice: 24.99
                }
            ];
            
            Product.find.mockResolvedValueOnce(mockProducts);
            
            const response = await request(app).get('/api/products');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
            expect(Product.find).toHaveBeenCalled();
        });
    });

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const productData = {
                url: 'https://www.uniqlo.com/nl/nl/test-product'
            };
            
            // Mock scraper
            scrapeUniqloProduct.mockResolvedValueOnce({
                name: 'Test Product',
                currentPrice: 29.99,
                originalPrice: 39.99
            });
            
            // Mock product creation
            const createdProduct = {
                _id: 'test-id-123',
                ...productData,
                name: 'Test Product',
                currentPrice: 29.99,
                originalPrice: 39.99,
                lastChecked: new Date().toISOString(),
                emailSent: false,
                onSale: true,
                message: "Product is on sale! (€39.99 → €29.99)"
            };
            
            Product.create.mockResolvedValueOnce(createdProduct);

            const response = await request(app)
                .post('/api/products')
                .send(productData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(createdProduct);
            expect(scrapeUniqloProduct).toHaveBeenCalledWith(productData.url);
            expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({
                url: productData.url,
                name: 'Test Product',
                currentPrice: 29.99,
                originalPrice: 39.99
            }));
        });

        it('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({});

            expect(response.status).toBe(400);
            expect(Product.create).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product', async () => {
            // Mock successful deletion
            Product.findByIdAndDelete.mockResolvedValueOnce(true);

            const response = await request(app)
                .delete('/api/products/test-id-123');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product deleted');
            expect(Product.findByIdAndDelete).toHaveBeenCalledWith('test-id-123');
        });

        it('should return 404 for non-existent product', async () => {
            // Mock unsuccessful deletion
            Product.findByIdAndDelete.mockResolvedValueOnce(false);

            const response = await request(app)
                .delete('/api/products/non-existent-id');

            expect(response.status).toBe(404);
            expect(Product.findByIdAndDelete).toHaveBeenCalledWith('non-existent-id');
        });
    });
}); 