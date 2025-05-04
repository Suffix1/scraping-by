const { checkPrices } = require('../../scripts/checkPrices');
const Product = require('../../models/Product');
const { scrapeUniqloProduct } = require('../../scrapers/uniqlo');

// Mock dependencies
jest.mock('../../scrapers/uniqlo');
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
    })
}));

describe('Price Checking Script', () => {
    beforeEach(async () => {
        await Product.deleteMany({});
        jest.clearAllMocks();
    });

    it('should not send email when no price drops are detected', async () => {
        // Create test product
        const product = new Product({
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        });
        await product.save();

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
        expect(scrapeUniqloProduct).toHaveBeenCalledWith(product.url, product.size);
        
        // Verify product was updated
        const updatedProduct = await Product.findById(product._id);
        expect(updatedProduct.lastChecked).not.toEqual(product.lastChecked);
    });

    it('should send email when price drops are detected', async () => {
        // Create test product
        const product = new Product({
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        });
        await product.save();

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
        
        // Verify product price was updated
        const updatedProduct = await Product.findById(product._id);
        expect(updatedProduct.currentPrice).toBe(19.99);
    });

    it('should handle scraper errors gracefully', async () => {
        // Create test product
        const product = new Product({
            url: 'https://www.uniqlo.com/nl/nl/test-product',
            size: 'M',
            name: 'Test Product',
            currentPrice: 29.99,
            originalPrice: 39.99
        });
        await product.save();

        // Mock the scraper to throw an error
        scrapeUniqloProduct.mockRejectedValueOnce(new Error('Scraper error'));
        
        const result = await checkPrices();
        
        expect(result.success).toBe(true); // Overall process should still succeed
        
        // Product should remain unchanged
        const updatedProduct = await Product.findById(product._id);
        expect(updatedProduct.currentPrice).toBe(product.currentPrice);
    });
}); 