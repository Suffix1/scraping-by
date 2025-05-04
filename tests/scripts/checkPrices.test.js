const { checkPrices } = require('../../scripts/checkPrices');
const Product = require('../../models/Product');
const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');
const db = require('../../db/fileDb');

// Mock dependencies
jest.mock('../../scrapers/uniqlo');
jest.mock('../../models/Product');
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
    })
}));

describe('Price Checking Script', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not send email when no price drops are detected', async () => {
        // Mock test product
        const mockProduct = {
            _id: 'test-id-123',
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99,
            lastChecked: new Date().toISOString()
        };
        
        // Setup mocks
        Product.find.mockResolvedValueOnce([mockProduct]);
        Product.findByIdAndUpdate.mockResolvedValueOnce({
            ...mockProduct,
            lastChecked: new Date().toISOString()
        });
        
        // Mock the scraper to return the same price
        scrapeUniqloProduct.mockResolvedValueOnce({
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99,
            sizeAvailable: true
        });

        const result = await checkPrices();
        
        expect(result.success).toBe(true);
        expect(result.priceDrops).toBe(false);
        expect(scrapeUniqloProduct).toHaveBeenCalledWith(mockProduct.url, mockProduct.size);
        expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
            mockProduct._id, 
            expect.objectContaining({
                currentPrice: 29.99,
                lastChecked: expect.any(String)
            })
        );
    });

    it('should send email when price drops are detected', async () => {
        // Mock test product
        const mockProduct = {
            _id: 'test-id-123',
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99,
            lastChecked: new Date().toISOString()
        };
        
        // Setup mocks
        Product.find.mockResolvedValueOnce([mockProduct]);
        Product.findByIdAndUpdate.mockResolvedValueOnce({
            ...mockProduct,
            currentPrice: 19.99,
            lastChecked: new Date().toISOString()
        });

        // Mock the scraper to return a lower price
        scrapeUniqloProduct.mockResolvedValueOnce({
            name: 'Test Product',
            currentPrice: 19.99,
            originalPrice: 39.99,
            sizeAvailable: true
        });
        
        const result = await checkPrices();
        
        expect(result.success).toBe(true);
        expect(result.priceDrops).toBe(true);
        expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
            mockProduct._id, 
            expect.objectContaining({
                currentPrice: 19.99,
                lastChecked: expect.any(String)
            })
        );
    });

    it('should handle scraper errors gracefully', async () => {
        // Mock test product
        const mockProduct = {
            _id: 'test-id-123',
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99,
            lastChecked: new Date().toISOString()
        };
        
        // Setup mocks
        Product.find.mockResolvedValueOnce([mockProduct]);

        // Mock the scraper to throw an error
        scrapeUniqloProduct.mockRejectedValueOnce(new Error('Scraper error'));
        
        const result = await checkPrices();
        
        expect(result.success).toBe(true); // Overall process should still succeed
        expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    });
}); 